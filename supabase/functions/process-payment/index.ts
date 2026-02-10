
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0?target=deno'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Validate Env Vars
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!mpAccessToken || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração do servidor incompleta (MP_ACCESS_TOKEN faltando).')
    }

    // 3. Authenticate User
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Usuário não autenticado.')
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Sessão de usuário inválida.')
    }

    // 4. Parse Body
    const { email, returnUrl } = await req.json();

    console.log(`Criando preferência MP para: ${email}`);

    // 5. Create Mercado Pago Preference via Fetch (No SDK needed for cleaner Edge function)
    const preferenceData = {
      items: [
        {
          id: "vistorilar_pro_lifetime",
          title: "Licença Vitalícia VistoriLar PRO",
          description: "Acesso ilimitado a geração de laudos e vistorias.",
          picture_url: "https://raw.githubusercontent.com/andrerieger/vistorilar/main/logo-removebg-preview%20(1)%20(1).png",
          category_id: "software",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 200.00
        }
      ],
      payer: {
        email: email,
        name: user.user_metadata?.full_name || "Cliente VistoriLar"
      },
      back_urls: {
        success: returnUrl, // Frontend URL to return to
        failure: returnUrl,
        pending: returnUrl
      },
      auto_return: "approved", // Redirect immediately on success
      external_reference: user.id, // We use this to identify the user in webhooks later
      statement_descriptor: "VISTORILAR PRO"
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`
      },
      body: JSON.stringify(preferenceData)
    });

    const mpResult = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Erro MP:", mpResult);
      throw new Error(`Erro no Mercado Pago: ${mpResult.message || 'Falha ao criar preferência'}`);
    }

    // 6. Return the Checkout URL (init_point)
    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: mpResult.init_point, // URL para redirecionar o usuário
        preferenceId: mpResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
