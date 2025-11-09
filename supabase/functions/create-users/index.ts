import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    const users = [
      // Regular Users (Customers)
      {
        email: 'user1@sibn.com',
        password: 'user123',
        role: 'customer',
        name: 'John Smith',
      },
      {
        email: 'user2@sibn.com',
        password: 'user123',
        role: 'customer',
        name: 'Sarah Johnson',
      },
      {
        email: 'user3@sibn.com',
        password: 'user123',
        role: 'customer',
        name: 'Mike Davis',
      },
      // Admin Users
      {
        email: 'admin1@sibn.com',
        password: 'admin123',
        role: 'admin',
        name: 'Admin One',
      },
      {
        email: 'admin2@sibn.com',
        password: 'admin123',
        role: 'admin',
        name: 'Admin Two',
      },
      {
        email: 'admin3@sibn.com',
        password: 'admin123',
        role: 'admin',
        name: 'Admin Three',
      },
    ];

    const results = [];

    for (const userData of users) {
      try {
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = existingUser?.users.some(u => u.email === userData.email);

        if (userExists) {
          results.push({
            email: userData.email,
            status: 'already_exists',
          });
          continue;
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        });

        if (error) {
          results.push({
            email: userData.email,
            status: 'error',
            error: error.message,
          });
          continue;
        }

        // Wait a bit for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update profile with role and name
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            full_name: userData.name,
            role: userData.role 
          })
          .eq('id', data.user.id);

        if (updateError) {
          results.push({
            email: userData.email,
            status: 'created_but_profile_update_failed',
            user_id: data.user.id,
            error: updateError.message,
          });
        } else {
          results.push({
            email: userData.email,
            status: 'created',
            user_id: data.user.id,
            role: userData.role,
          });
        }
      } catch (err) {
        results.push({
          email: userData.email,
          status: 'error',
          error: err.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});