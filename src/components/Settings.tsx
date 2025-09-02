import React, { useState, useEffect } from 'react'
import { soundManager } from '../utils/soundManager'

interface SettingsProps {
	isOpen: boolean
	onClose: () => void
}

interface Settings {
	soundEnabled: boolean
	soundVolume: number
	animationsEnabled: boolean
	autoSave: boolean
}

const defaultSettings: Settings = {
	soundEnabled: true,
	soundVolume: 0.5,
	animationsEnabled: true,
	autoSave: true,
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
	const [settings, setSettings] = useState<Settings>(defaultSettings)

	useEffect(() => {
		// Load settings from localStorage
		const savedSettings = localStorage.getItem('pokemon-battle-settings')
		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings)
				setSettings({ ...defaultSettings, ...parsed })
			} catch (error) {
				console.warn('Failed to parse saved settings:', error)
			}
		}
	}, [])

	useEffect(() => {
		// Save settings to localStorage
		localStorage.setItem('pokemon-battle-settings', JSON.stringify(settings))

		// Apply sound settings
		soundManager.setEnabled(settings.soundEnabled)
		soundManager.setVolume(settings.soundVolume)
	}, [settings])

	const updateSetting = <K extends keyof Settings>(
		key: K,
		value: Settings[K],
	) => {
		setSettings(prev => ({ ...prev, [key]: value }))
	}

	const resetSettings = () => {
		setSettings(defaultSettings)
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'>
			<div className='bg-slate-800 rounded-lg border border-slate-600 max-w-md w-full p-6'>
				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-bold text-yellow-400'>Settings</h2>
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

				<div className='space-y-6'>
					{/* Sound Settings */}
					<div>
						<h3 className='text-lg font-semibold text-white mb-3'>Audio</h3>
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<label className='text-gray-300'>Sound Effects</label>
								<button
									onClick={() =>
										updateSetting('soundEnabled', !settings.soundEnabled)
									}
									className={`relative w-12 h-6 rounded-full transition-colors ${
										settings.soundEnabled ? 'bg-green-600' : 'bg-gray-600'
									}`}>
									<div
										className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
											settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
										}`}
									/>
								</button>
							</div>

							{settings.soundEnabled && (
								<div>
									<label className='text-gray-300 block mb-2'>
										Volume: {Math.round(settings.soundVolume * 100)}%
									</label>
									<input
										type='range'
										min='0'
										max='1'
										step='0.1'
										value={settings.soundVolume}
										onChange={e =>
											updateSetting('soundVolume', parseFloat(e.target.value))
										}
										className='w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider'
									/>
								</div>
							)}
						</div>
					</div>

					{/* Animation Settings */}
					<div>
						<h3 className='text-lg font-semibold text-white mb-3'>Interface</h3>
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<label className='text-gray-300'>Animations</label>
								<button
									onClick={() =>
										updateSetting(
											'animationsEnabled',
											!settings.animationsEnabled,
										)
									}
									className={`relative w-12 h-6 rounded-full transition-colors ${
										settings.animationsEnabled ? 'bg-green-600' : 'bg-gray-600'
									}`}>
									<div
										className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
											settings.animationsEnabled
												? 'translate-x-7'
												: 'translate-x-1'
										}`}
									/>
								</button>
							</div>

							<div className='flex items-center justify-between'>
								<label className='text-gray-300'>Auto-save Progress</label>
								<button
									onClick={() => updateSetting('autoSave', !settings.autoSave)}
									className={`relative w-12 h-6 rounded-full transition-colors ${
										settings.autoSave ? 'bg-green-600' : 'bg-gray-600'
									}`}>
									<div
										className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
											settings.autoSave ? 'translate-x-7' : 'translate-x-1'
										}`}
									/>
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className='flex gap-3 mt-8'>
					<button
						onClick={resetSettings}
						className='flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors'>
						Reset to Defaults
					</button>
					<button
						onClick={onClose}
						className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors'>
						Done
					</button>
				</div>
			</div>
		</div>
	)
}

// Hook to use settings throughout the app
export const useSettings = () => {
	const [settings, setSettings] = useState<Settings>(defaultSettings)

	useEffect(() => {
		const savedSettings = localStorage.getItem('pokemon-battle-settings')
		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings)
				setSettings({ ...defaultSettings, ...parsed })
			} catch (error) {
				console.warn('Failed to parse saved settings:', error)
			}
		}
	}, [])

	return settings
}
