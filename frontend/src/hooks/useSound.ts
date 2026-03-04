import { useCallback, useRef } from 'react'

/**
 * useSound Hook
 * Web Audio API를 사용하여 절차적으로 게임 효과음을 생성합니다.
 * 외부 파일 없이 AudioContext로 직접 사운드를 합성합니다.
 */
export function useSound() {
    const audioCtxRef = useRef<AudioContext | null>(null)

    /** AudioContext lazy 초기화 */
    const getCtx = useCallback((): AudioContext => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        }
        return audioCtxRef.current
    }, [])

    /**
     * 간단한 톤 재생 헬퍼
     * @param freq - 주파수 (Hz)
     * @param duration - 길이 (초)
     * @param type - 파형 타입
     * @param startDelay - 시작 지연 (초, 기본 0)
     * @param gain - 볼륨 (기본 0.3)
     */
    const playTone = useCallback(
        (
            freq: number,
            duration: number,
            type: OscillatorType = 'sine',
            startDelay = 0,
            gain = 0.3
        ) => {
            try {
                const ctx = getCtx()
                const osc = ctx.createOscillator()
                const gainNode = ctx.createGain()

                osc.connect(gainNode)
                gainNode.connect(ctx.destination)

                osc.type = type
                osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay)

                gainNode.gain.setValueAtTime(gain, ctx.currentTime + startDelay)
                gainNode.gain.exponentialRampToValueAtTime(
                    0.001,
                    ctx.currentTime + startDelay + duration
                )

                osc.start(ctx.currentTime + startDelay)
                osc.stop(ctx.currentTime + startDelay + duration)
            } catch {
                // 사운드 실패는 게임에 영향 주지 않음
            }
        },
        [getCtx]
    )

    /** 카드 뒤집기 효과음 — 짧은 클릭 */
    const playFlip = useCallback(() => {
        playTone(440, 0.08, 'square', 0, 0.15)
    }, [playTone])

    /** 매칭 성공 효과음 — 상승 두음 */
    const playMatch = useCallback(() => {
        playTone(523, 0.12, 'sine', 0, 0.3)   // C5
        playTone(659, 0.18, 'sine', 0.1, 0.3) // E5
    }, [playTone])

    /** 매칭 실패 효과음 — 하강 두음 */
    const playFail = useCallback(() => {
        playTone(300, 0.1, 'sawtooth', 0, 0.25)
        playTone(220, 0.15, 'sawtooth', 0.1, 0.25)
    }, [playTone])

    /** 승리 효과음 — 4음 팡파르 */
    const playVictory = useCallback(() => {
        const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
        notes.forEach((freq, i) => {
            playTone(freq, 0.2, 'sine', i * 0.15, 0.35)
        })
    }, [playTone])

    /** 게임 오버 효과음 — 하강 3음 */
    const playGameOver = useCallback(() => {
        playTone(440, 0.2, 'sawtooth', 0, 0.3)
        playTone(349, 0.2, 'sawtooth', 0.2, 0.3)
        playTone(261, 0.35, 'sawtooth', 0.4, 0.3)
    }, [playTone])

    return { playFlip, playMatch, playFail, playVictory, playGameOver }
}
