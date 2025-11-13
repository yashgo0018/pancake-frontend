import { useToast } from '@pancakeswap/uikit'
import { useCallback, useState } from 'react'

interface CheckAvailabilityResponse {
  available: boolean
  subdomain: string
}

interface MintSubdomainResponse {
  success: boolean
  transactionHash?: string
  name?: string
  error?: string
}

export const useEnsSubdomain = () => {
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const { toastError, toastSuccess } = useToast()

  const checkAvailability = useCallback(
    async (subdomain: string): Promise<boolean> => {
      setIsCheckingAvailability(true)
      try {
        const response = await fetch(`/api/ens/check-availability?subdomain=${encodeURIComponent(subdomain)}`)
        const data: CheckAvailabilityResponse = await response.json()

        if (!response.ok) {
          throw new Error((data as any).error || 'Failed to check availability')
        }

        return data.available
      } catch (error: any) {
        console.error('Error checking availability:', error)
        toastError('Error', error.message || 'Failed to check subdomain availability')
        return false
      } finally {
        setIsCheckingAvailability(false)
      }
    },
    [toastError],
  )

  const mintSubdomain = useCallback(
    async (subdomain: string, address: string): Promise<MintSubdomainResponse | null> => {
      setIsMinting(true)
      try {
        const response = await fetch('/api/ens/mint-subdomain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subdomain,
            address,
          }),
        })

        const data: MintSubdomainResponse = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to mint subdomain')
        }

        if (data.success) {
          toastSuccess('Success!', `ENS subdomain ${data.name} has been minted successfully!`)
        }

        return data
      } catch (error: any) {
        console.error('Error minting subdomain:', error)
        toastError('Error', error.message || 'Failed to mint subdomain')
        return null
      } finally {
        setIsMinting(false)
      }
    },
    [toastError, toastSuccess],
  )

  return {
    checkAvailability,
    mintSubdomain,
    isCheckingAvailability,
    isMinting,
  }
}
