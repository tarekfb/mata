import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  text: string
  restaurant_id: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, restaurant_id }: RequestBody = await req.json()

    if (!text || !restaurant_id) {
      return new Response(
        JSON.stringify({ error: 'Text and restaurant_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate embedding using Supabase's built-in AI
    const model = new Supabase.ai.Session('gte-small')
    const embedding = await model.run(text, { 
      mean_pool: true, 
      normalize: true 
    })

    // Find the most recent review without an embedding for this restaurant
    const { data: review, error: selectError } = await supabase
      .from('reviews')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('content', text)
      .is('embedding', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (selectError || !review) {
      console.error('Error finding review:', selectError)
      return new Response(
        JSON.stringify({ error: 'Review not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the review with the generated embedding
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ embedding: embedding })
      .eq('id', review.id)

    if (updateError) {
      console.error('Error updating review with embedding:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to save embedding' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Embedding generated and saved successfully',
        review_id: review.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-embedding function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})