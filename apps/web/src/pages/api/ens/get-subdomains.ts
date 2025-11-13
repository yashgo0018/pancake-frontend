import type { NextApiRequest, NextApiResponse } from 'next'
import { isAddress } from 'viem'
import { createNamestoneClient } from 'utils/namestone'

type ResponseData = {
  subdomains?: string[]
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { address } = req.query

    // Validate address
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Address is required' })
    }

    // Validate Ethereum address
    if (!isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' })
    }

    const namestoneClient = createNamestoneClient()

    // Get all names for this address using the Namestone client method
    const names = await namestoneClient.getSubdomainInfo(address)

    // Extract subdomain names from the response
    const subdomains: string[] = []

    if (Array.isArray(names)) {
      names.forEach((nameObj: any) => {
        if (nameObj.name && typeof nameObj.name === 'string') {
          subdomains.push(`${nameObj.name}.${process.env.NEXT_PUBLIC_NAMESTONE_PROJECT_ENS}`)
        }
      })
    }

    return res.status(200).json({
      subdomains,
    })
  } catch (error: any) {
    console.error('Error fetching subdomains:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch subdomains',
    })
  }
}
