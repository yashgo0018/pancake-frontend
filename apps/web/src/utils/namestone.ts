/**
 * Namestone ENS API integration
 * Documentation: https://namestone.com/docs
 * Based on SDK: https://github.com/namestonehq/namestone-sdk
 */

const NAMESTONE_API_BASE_URL = 'https://namestone.com/api/public_v1'

interface NamestoneConfig {
  apiKey: string
  projectEns: string
}

interface CheckSubdomainAvailabilityResponse {
  available: boolean
  name: string
}

interface MintSubdomainResponse {
  success: boolean
  transactionHash?: string
  error?: string
  name?: string
}

export class NamestoneAPI {
  private apiKey: string

  private projectEns: string

  constructor(config: NamestoneConfig) {
    this.apiKey = config.apiKey
    this.projectEns = config.projectEns
  }

  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const url = `${NAMESTONE_API_BASE_URL}${endpoint}`

    const headers: Record<string, string> = {
      Authorization: this.apiKey,
      'Content-Type': 'application/json',
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage =
          (errorData as any)?.message || (errorData as any)?.error || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      console.error('Namestone API error:', error)
      throw error
    }
  }

  /**
   * Check if a subdomain is available by searching for it
   */
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    try {
      // Use search-names endpoint to check if subdomain exists (GET request with query params)
      const params = new URLSearchParams({
        domain: this.projectEns,
        name: subdomain,
      })

      const response = await this.makeRequest<any>(`/search-names?${params.toString()}`, 'GET')

      // If no results or the specific subdomain is not found, it's available
      if (!response || !Array.isArray(response) || response.length === 0) {
        return true
      }

      // Check if the exact subdomain exists
      const exists = response.some((name: any) => name.name === subdomain)
      return !exists
    } catch (error) {
      console.error('Error checking subdomain availability:', error)
      // On error, assume not available to be safe
      return false
    }
  }

  /**
   * Mint a subdomain for a user using the set-name endpoint
   */
  async mintSubdomain(subdomain: string, address: string): Promise<MintSubdomainResponse> {
    try {
      const fullDomain = `${subdomain}.${this.projectEns}`

      // Use set-name endpoint to create/mint the subdomain
      const response = await this.makeRequest<any>('/set-name', 'POST', {
        name: subdomain,
        domain: this.projectEns,
        address,
        // Optional: Add additional records if needed
        // text_records: {
        //   description: `PancakeSwap ENS for ${address}`,
        // },
      })

      return {
        success: true,
        name: fullDomain,
        transactionHash: response.transactionHash,
      }
    } catch (error: any) {
      console.error('Error minting subdomain:', error)
      return {
        success: false,
        error: error.message || 'Failed to mint subdomain',
      }
    }
  }

  /**
   * Get subdomain information using get-names endpoint
   */
  async getSubdomainInfo(address?: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        domain: this.projectEns,
      })

      if (address) {
        params.append('address', address)
      }

      return await this.makeRequest(`/get-names?${params.toString()}`, 'GET')
    } catch (error) {
      console.error('Error getting subdomain info:', error)
      throw error
    }
  }
}

/**
 * Create a Namestone API instance
 */
export function createNamestoneClient(): NamestoneAPI {
  const apiKey = process.env.NAMESTONE_API_KEY
  const projectEns = process.env.NEXT_PUBLIC_NAMESTONE_PROJECT_ENS

  if (!apiKey || !projectEns) {
    throw new Error('Namestone API credentials are not configured')
  }

  return new NamestoneAPI({
    apiKey,
    projectEns,
  })
}
