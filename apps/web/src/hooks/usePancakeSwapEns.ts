import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

interface UsePancakeSwapEnsResult {
  subdomain: string | null
  subdomains: string[]
  isLoading: boolean
  refetch: () => void
}

/**
 * Hook to fetch PancakeSwap ENS subdomains for a given address
 */
export const usePancakeSwapEns = (address?: string): UsePancakeSwapEnsResult => {
  const {
    data: subdomains = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['pancakeswap-ens', address],
    queryFn: async () => {
      if (!address) return []

      const response = await fetch(`/api/ens/get-subdomains?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subdomains')
      }

      return data.subdomains || []
    },
    enabled: Boolean(address),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })

  const refetchSubdomains = useCallback(() => {
    refetch()
  }, [refetch])

  // Return the first subdomain as the primary one
  const primarySubdomain = subdomains.length > 0 ? subdomains[0] : null

  return {
    subdomain: primarySubdomain,
    subdomains,
    isLoading,
    refetch: refetchSubdomains,
  }
}
