import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request, locals: { supabase }, fetch }) => {
		const formData = await request.formData()
		const restaurantId = formData.get('restaurant_id') as string
		const tableId = formData.get('table_id') as string
		const feedback = formData.get('feedback') as string

		if (!feedback || feedback.trim().length === 0) {
			return fail(400, { error: 'Feedback krävs' })
		}

		if (feedback.length > 200) {
			return fail(400, { error: 'Feedback får inte vara längre än 200 tecken' })
		}

		try {
			// First, verify the restaurant exists
			const { data: restaurant, error: restaurantError } = await supabase
				.from('restaurants')
				.select('id')
				.eq('id', restaurantId)
				.single()

			if (restaurantError || !restaurant) {
				return fail(404, { error: 'Restaurang hittades inte' })
			}

			// Insert the review
			const { error: insertError } = await supabase
				.from('reviews')
				.insert({
					restaurant_id: restaurantId,
					table_id: tableId || null,
					content: feedback.trim()
				})

			if (insertError) {
				console.error('Error inserting review:', insertError)
				return fail(500, { error: 'Kunde inte spara feedback' })
			}

			// Call edge function to generate embedding
			try {
				const response = await fetch('/api/generate-embedding', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						text: feedback.trim(),
						restaurant_id: restaurantId
					})
				})

				if (!response.ok) {
					console.error('Failed to generate embedding:', await response.text())
				}
			} catch (embeddingError) {
				console.error('Error calling embedding function:', embeddingError)
				// Don't fail the request if embedding generation fails
			}

			return { success: true }
		} catch (error) {
			console.error('Error submitting feedback:', error)
			return fail(500, { error: 'Ett fel uppstod. Försök igen.' })
		}
	}
}