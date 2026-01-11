<script lang="ts">
	import { Button } from '$lib/components/ui/button'
</script>

<svelte:head>
	<title>Mata | Feedback</title>
	<meta name="description" content="Anonym feedback för restauranger i Sverige" />
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center p-4">
	<div class="max-w-md w-full text-center space-y-8">
		<div class="space-y-4">
			<h1 class="text-4xl font-bold text-foreground">Feedback Sverige</h1>
			<p class="text-lg text-muted-foreground">
				Anonym feedback för restauranger i Sverige
			</p>
		</div>
		
		<div class="space-y-4">
			<p class="text-muted-foreground">
				Hjälp restauranger att förbättra sin service genom anonym feedback.
			</p>
			
			<Button 
				href="/portal/login" 
				class="w-full bg-accent hover:bg-acccent/75 text-foreground font-medium py-3 px-6 rounded-lg transition-colors"
			>
				För Restauranger
			</Button>
		</div>
		
		<div class="text-sm text-gray-500 space-y-2">
			<p>Kunder: Scanna QR-koden på ditt bord för att lämna feedback</p>
		</div>
	</div>
</div>