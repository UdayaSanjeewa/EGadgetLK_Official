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
      // Regular Users
      {
        email: 'user1@sibn.com',
        password: 'user123',
        role: 'user',
        name: 'John Smith',
      },
      {
        email: 'user2@sibn.com',
        password: 'user123',
        role: 'user',
        name: 'Sarah Johnson',
      },
      {
        email: 'user3@sibn.com',
        password: 'user123',
        role: 'user',
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
      // Seller Users
      {
        email: 'seller1@sibn.com',
        password: 'seller123',
        role: 'seller',
        name: 'Tech Store',
        businessName: 'Tech Store Electronics',
        businessEmail: 'contact@techstore.com',
        businessPhone: '+1234567890',
      },
      {
        email: 'seller2@sibn.com',
        password: 'seller123',
        role: 'seller',
        name: 'Fashion Hub',
        businessName: 'Fashion Hub Clothing',
        businessEmail: 'info@fashionhub.com',
        businessPhone: '+1234567891',
      },
      {
        email: 'seller3@sibn.com',
        password: 'seller123',
        role: 'seller',
        name: 'Home Goods',
        businessName: 'Home Goods Essentials',
        businessEmail: 'support@homegoods.com',
        businessPhone: '+1234567892',
      },
    ];

    const results = [];

    for (const userData of users) {
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
        user_metadata: {
          role: userData.role,
        },
      });

      if (error) {
        results.push({
          email: userData.email,
          status: 'error',
          error: error.message,
        });
      } else {
        // Create user profile for all users
        await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
          });

        // Create seller profile if user is a seller
        if (userData.role === 'seller') {
          await supabaseAdmin
            .from('seller_profiles')
            .insert({
              id: data.user.id,
              business_name: userData.businessName,
              business_email: userData.businessEmail,
              business_phone: userData.businessPhone,
              is_verified: true,
              is_active: true,
            });
        }

        results.push({
          email: userData.email,
          status: 'created',
          user_id: data.user.id,
          role: userData.role,
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