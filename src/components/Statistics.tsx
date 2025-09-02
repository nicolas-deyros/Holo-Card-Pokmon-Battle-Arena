import React from 'react'
import { statsManager, Achievement, BattleStats } from '../utils/statsManager'

interface StatisticsProps {
	isOpen: boolean
	onClose: () => void
}

const StatCard: React.FC<{
	title: string
	value: string | number
	icon: string
	description?: string
}> = ({ title, value, icon, description }) => (
	<div className='bg-slate-700/50 p-4 rounded-lg border border-slate-600'>
		<div className='flex items-center justify-between mb-2'>
			<span className='text-gray-300 text-sm'>{title}</span>
			<span className='text-2xl'>{icon}</span>
		</div>
		<div className='text-2xl font-bold text-white'>{value}</div>
		{description && (
			<div className='text-xs text-gray-400 mt-1'>{description}</div>
		)}
	</div>
)

const AchievementCard: React.FC<{
	achievement: Achievement & { unlocked: boolean }
}> = ({ achievement }) => (
	<div
		className={`p-3 rounded-lg border flex items-center gap-3 ${
			achievement.unlocked
				? 'bg-green-900/30 border-green-600/50'
				: 'bg-slate-700/30 border-slate-600/50'
		}`}>
		<div
			className={`text-2xl ${
				achievement.unlocked ? '' : 'grayscale opacity-50'
			}`}>
			{achievement.icon}
		</div>
		<div className='flex-1'>
			<h4
				className={`font-semibold ${
					achievement.unlocked ? 'text-green-400' : 'text-gray-400'
				}`}>
				{achievement.name}
			</h4>
			<p className='text-sm text-gray-300'>{achievement.description}</p>
		</div>
		{achievement.unlocked && (
			<div className='text-green-400'>
				<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
					<path
						fillRule='evenodd'
						d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
						clipRule='evenodd'
					/>
				</svg>
			</div>
		)}
	</div>
)

export const Statistics: React.FC<StatisticsProps> = ({ isOpen, onClose }) => {
	const [stats, setStats] = React.useState<BattleStats>(statsManager.getStats())
	const [achievements, setAchievements] = React.useState<
		(Achievement & { unlocked: boolean })[]
	>([])

	React.useEffect(() => {
		if (isOpen) {
			setStats(statsManager.getStats())
			setAchievements(statsManager.getAllAchievements())
		}
	}, [isOpen])

	const winRate = statsManager.getWinRate()

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'>
			<div className='bg-slate-800 rounded-lg border border-slate-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
				<div className='sticky top-0 bg-slate-800 p-6 border-b border-slate-600'>
					<div className='flex justify-between items-center'>
						<h2 className='text-3xl font-bold text-yellow-400'>
							Trainer Statistics
						</h2>
						<button
							onClick={onClose}
							className='text-gray-400 hover:text-white transition-colors'>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M6 18L18 6M6 6l12 12' />
							</svg>
						</button>
					</div>
				</div>

				<div className='p-6 space-y-8'>
					{/* Overview Stats */}
					<div>
						<h3 className='text-xl font-semibold text-white mb-4'>
							Battle Overview
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
							<StatCard
								title='Total Battles'
								value={stats.totalBattles}
								icon='⚔️'
							/>
							<StatCard title='Victories' value={stats.wins} icon='🏆' />
							<StatCard
								title='Win Rate'
								value={`${winRate.toFixed(1)}%`}
								icon='📊'
							/>
							<StatCard
								title='Best Streak'
								value={stats.longestWinStreak}
								icon='🔥'
							/>
						</div>
					</div>

					{/* Detailed Stats */}
					<div>
						<h3 className='text-xl font-semibold text-white mb-4'>
							Detailed Statistics
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							<StatCard
								title='Pokémon Encountered'
								value={stats.pokemonEncountered.size}
								icon='🗺️'
								description='Unique species met'
							/>
							<StatCard
								title='Damage Dealt'
								value={stats.totalDamageDealt.toLocaleString()}
								icon='💥'
								description='Total HP damage'
							/>
							<StatCard
								title='Damage Taken'
								value={stats.totalDamageTaken.toLocaleString()}
								icon='🛡️'
								description='Total HP lost'
							/>
						</div>
					</div>

					{/* Achievements */}
					<div>
						<h3 className='text-xl font-semibold text-white mb-4'>
							Achievements ({achievements.filter(a => a.unlocked).length}/
							{achievements.length})
						</h3>
						<div className='space-y-3'>
							{achievements.map(achievement => (
								<AchievementCard
									key={achievement.id}
									achievement={achievement}
								/>
							))}
						</div>
					</div>

					{/* Progress Bars for key stats */}
					<div>
						<h3 className='text-xl font-semibold text-white mb-4'>Progress</h3>
						<div className='space-y-4'>
							<div>
								<div className='flex justify-between text-sm text-gray-300 mb-1'>
									<span>Pokémon Explorer Progress</span>
									<span>{stats.pokemonEncountered.size}/100</span>
								</div>
								<div className='w-full bg-gray-700 rounded-full h-2'>
									<div
										className='bg-blue-600 h-2 rounded-full transition-all duration-500'
										style={{
											width: `${Math.min(
												100,
												(stats.pokemonEncountered.size / 100) * 100,
											)}%`,
										}} />
								</div>
							</div>

							<div>
								<div className='flex justify-between text-sm text-gray-300 mb-1'>
									<span>Veteran Trainer Progress</span>
									<span>{stats.totalBattles}/50</span>
								</div>
								<div className='w-full bg-gray-700 rounded-full h-2'>
									<div
										className='bg-green-600 h-2 rounded-full transition-all duration-500'
										style={{
											width: `${Math.min(
												100,
												(stats.totalBattles / 50) * 100,
											)}%`,
										}} />
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-3 pt-4 border-t border-slate-600'>
						<button
							onClick={() => {
								if (
									confirm(
										'Are you sure you want to reset all statistics? This cannot be undone.',
									)
								) {
									statsManager.resetStats()
									setStats(statsManager.getStats())
									setAchievements(statsManager.getAllAchievements())
								}
							}}
							className='px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors'>
							Reset Statistics
						</button>
						<button
							onClick={onClose}
							className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors'>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
