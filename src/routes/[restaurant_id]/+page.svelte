<script lang="ts">
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { Button } from '$lib/components/ui/button'
	import type { ActionData } from './$types'

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let restaurantId = $derived($page.params.restaurant_id)
	let tableId = $derived($page.url.searchParams.get('table_id'))

	let feedback = $state('')
	let isSubmitting = $state(false)
</script>

<svelte:head>
	<title>Lämna Feedback</title>
	<meta name="description" content="Lämna anonym feedback för restaurangen" />
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
			<div class="text-center space-y-2">
				<h1 class="text-2xl font-bold text-black">Lämna din feedback</h1>
				<p class="text-gray-600">Din åsikt hjälper oss att förbättra vår service</p>
				{#if tableId}
					<p class="text-sm text-gray-500">Bord: {tableId}</p>
				{/if}
			</div>

			{#if form?.success}
				<div class="text-center space-y-4">
					<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
						<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
					<h2 class="text-xl font-semibold text-black">Tack för din feedback!</h2>
					<p class="text-gray-600">Din åsikt är viktig för oss.</p>
				</div>
			{:else}
				<form method="POST" use:enhance={() => {
					isSubmitting = true
					return async ({ update }) => {
						await update()
						isSubmitting = false
						if (!form?.error) {
							feedback = ''
						}
					}
				}}>
					<input type="hidden" name="restaurant_id" value={restaurantId} />
					<input type="hidden" name="table_id" value={tableId || ''} />
					
					<div class="space-y-4">
						<div>
							<label for="feedback" class="block text-sm font-medium text-black mb-2">
								Lämna din feedback här...
							</label>
							<textarea
								id="feedback"
								name="feedback"
								bind:value={feedback}
								maxlength="200"
								rows="4"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
								placeholder="Berätta om din upplevelse..."
								required
							></textarea>
							<div class="text-right text-xs text-gray-500 mt-1">
								{feedback.length}/200 tecken
							</div>
						</div>

						{#if form?.error}
							<div class="text-red-600 text-sm">
								{form.error}
							</div>
						{/if}

						<Button 
							type="submit" 
							disabled={isSubmitting || feedback.trim().length === 0}
							class="w-full bg-accent hover:bg-accent/75 disabled:bg-gray-400 text-accent-foreground font-medium py-3 px-6 rounded-lg transition-colors"
						>
							{isSubmitting ? 'Skickar...' : 'Skicka'}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>