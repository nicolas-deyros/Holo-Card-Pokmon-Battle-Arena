import React, { useState, useCallback } from 'react'
import { AutocompleteSearch } from './components/AutocompleteSearch'
import { Battlefield } from './components/Battlefield'
import { EvolutionMap } from './components/EvolutionMap'
import { TeamSelection } from './components/TeamSelection'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Settings } from './components/Settings'
import { Statistics } from './components/Statistics'
import { ToastProvider } from './components/Toast'
import { POPULAR_POKEMON } from './constants'
import type { Pokemon } from './types'
import { getPokemonDetails } from './services/pokeapi'
import { LoadingSpinner } from './components/LoadingSpinner'
import { PokemonCard } from './components/PokemonCard'

type View = 'menu' | 'team_selection' | 'battle' | 'evolution'

const App: React.FC = () => {
	const [view, setView] = useState<View>('menu')
	const [selectedPokemonName, setSelectedPokemonName] = useState<string | null>(
		null,
	)
	const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [popularPokemonDetails, setPopularPokemonDetails] = useState<Pokemon[]>(
		[],
	)
	const [showSettings, setShowSettings] = useState<boolean>(false)
	const [showStatistics, setShowStatistics] = useState<boolean>(false)

	const fetchPopularPokemon = useCallback(async () => {
		setIsLoading(true)
		try {
			const promises = POPULAR_POKEMON.map(name => getPokemonDetails(name))
			const results = await Promise.all(promises)
			setPopularPokemonDetails(results.filter((p): p is Pokemon => p !== null))
		} catch (error) {
			console.error('Failed to fetch popular pokemon:', error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	React.useEffect(() => {
		fetchPopularPokemon()
	}, [fetchPopularPokemon])

	const handleStartTeamSelection = (pokemonName: string) => {
		setSelectedPokemonName(pokemonName)
		setView('team_selection')
	}

	const handleConfirmTeam = (team: Pokemon[]) => {
		setPlayerTeam(team)
		setView('battle')
	}

	const handleViewEvolution = (pokemonName: string) => {
		setSelectedPokemonName(pokemonName)
		setView('evolution')
	}

	const handleBackToMenu = () => {
		setSelectedPokemonName(null)
		setPlayerTeam([])
		setView('menu')
	}

	const renderView = () => {
		switch (view) {
			case 'team_selection':
				return (
					<TeamSelection
						initialPokemonName={selectedPokemonName}
						onTeamConfirm={handleConfirmTeam}
						onBack={handleBackToMenu}
					/>
				)
			case 'battle':
				return <Battlefield playerTeam={playerTeam} onBack={handleBackToMenu} />
			case 'evolution':
				return (
					selectedPokemonName && (
						<EvolutionMap
							pokemonName={selectedPokemonName}
							onBack={handleBackToMenu}
						/>
					)
				)
			case 'menu':
			default:
				return (
					<div className='container mx-auto p-4 md:p-8 text-center'>
						<div className='flex justify-end mb-4 gap-2'>
							<button
								onClick={() => setShowStatistics(true)}
								className='p-2 bg-purple-600 hover:bg-purple-500 rounded-full transition-transform transform hover:scale-105'
								title='Statistics'>
								<svg
									className='w-5 h-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
								</svg>
							</button>
							<button
								onClick={() => setShowSettings(true)}
								className='p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-transform transform hover:scale-105'
								title='Settings'>
								<svg
									className='w-5 h-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
								</svg>
							</button>
						</div>
						<h1
							className='text-4xl md:text-6xl font-bold tracking-tight text-yellow-400 mb-2'
							style={{ textShadow: '2px 2px 4px #000000' }}>
							Pokémon Battle Arena
						</h1>
						<p className='text-slate-300 mb-8 text-lg'>
							Search for a Pokémon to build your team and start a battle, or
							view its evolution tree.
						</p>
						<AutocompleteSearch onSelectPokemon={setSelectedPokemonName} />

						{selectedPokemonName && (
							<div className='mt-4 flex justify-center gap-4 animate-fade-in'>
								<button
									onClick={() => handleStartTeamSelection(selectedPokemonName)}
									className='px-6 py-2 bg-green-600 hover:bg-green-500 rounded-full font-bold transition-transform transform hover:scale-105'>
									Start Battle
								</button>
								<button
									onClick={() => handleViewEvolution(selectedPokemonName)}
									className='px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-transform transform hover:scale-105'>
									View Evolution
								</button>
							</div>
						)}

						<h2 className='text-3xl font-bold mt-12 mb-6 text-yellow-300'>
							Popular Pokémon
						</h2>
						{isLoading ? (
							<LoadingSpinner />
						) : (
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8'>
								{popularPokemonDetails.map(p => (
									<div
										key={p.id}
										className='cursor-pointer'
										onClick={() => handleStartTeamSelection(p.name)}>
										<PokemonCard
											pokemon={p}
											isActive={false}
											isPlayer={true}
											displayMode='compact'
										/>
									</div>
								))}
							</div>
						)}
					</div>
				)
		}
	}

	return (
		<ErrorBoundary>
			<ToastProvider>
				<main className='min-h-screen flex items-center justify-center'>
					<div key={view} className='animate-fade-in-scale w-full'>
						{renderView()}
					</div>
				</main>
				<Settings
					isOpen={showSettings}
					onClose={() => setShowSettings(false)}
				/>
				<Statistics
					isOpen={showStatistics}
					onClose={() => setShowStatistics(false)}
				/>
			</ToastProvider>
		</ErrorBoundary>
	)
}

export default App
