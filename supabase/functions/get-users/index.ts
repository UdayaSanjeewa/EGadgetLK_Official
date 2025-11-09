import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (userId) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('total_amount')
        .eq('user_id', userId);

      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const { count: orderCount } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const userDetails = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: authUser?.user?.user_metadata?.role || 'user',
        created_at: profile.created_at,
        last_sign_in_at: authUser?.user?.last_sign_in_at || profile.created_at,
        order_count: orderCount || 0,
        total_spent: totalSpent,
        address: profile.address,
        city: profile.city,
        mobile: profile.mobile,
      };

      return new Response(
        JSON.stringify({ user: userDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) throw authError;

    const usersWithMetadata = await Promise.all(
      (profiles || []).map(async (profile) => {
        const authUser = authUsers?.find((u) => u.id === profile.id);

        const { count: orderCount } = await supabaseAdmin
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: authUser?.user_metadata?.role || 'user',
          created_at: profile.created_at,
          last_sign_in_at: authUser?.last_sign_in_at || profile.created_at,
          order_count: orderCount || 0,
        };
      })
    );

    return new Response(
      JSON.stringify({ users: usersWithMetadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});