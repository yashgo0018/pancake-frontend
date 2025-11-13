import type { NextApiRequest, NextApiResponse } from 'next'
import { isAddress } from 'viem'
import { createNamestoneClient } from 'utils/namestone'

type ResponseData = {
  success?: boolean
  transactionHash?: string
  name?: string
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subdomain, address } = req.body

    // Validate inputs
    if (!subdomain || typeof subdomain !== 'string') {
      return res.status(400).json({ error: 'Subdomain is required' })
    }

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Address is required' })
    }

    // Validate Ethereum address
    if (!isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' })
    }

    // Validate subdomain format (alphanumeric and hyphens only, 3-63 characters)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        error: 'Invalid subdomain format. Use lowercase letters, numbers, and hyphens (3-63 characters)',
      })
    }

    const namestoneClient = createNamestoneClient()

    // First check if subdomain is available
    const available = await namestoneClient.checkSubdomainAvailability(subdomain)

    if (!available) {
      return res.status(409).json({
        error: 'Subdomain is already taken',
      })
    }

    // Mint the subdomain
    const result = await namestoneClient.mintSubdomain(subdomain, address)

    if (!result.success) {
      return res.status(500).json({
        error: result.error || 'Failed to mint subdomain',
      })
    }

    return res.status(200).json({
      success: true,
      transactionHash: result.transactionHash,
      name: result.name || `${subdomain}.${process.env.NEXT_PUBLIC_NAMESTONE_PROJECT_ENS}`,
    })
  } catch (error: any) {
    console.error('Error minting subdomain:', error)
    return res.status(500).json({
      error: error.message || 'Failed to mint subdomain',
    })
  }
}
