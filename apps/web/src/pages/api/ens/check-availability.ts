import type { NextApiRequest, NextApiResponse } from 'next'
import { createNamestoneClient } from 'utils/namestone'

type ResponseData = {
  available?: boolean
  error?: string
  subdomain?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subdomain } = req.query

    if (!subdomain || typeof subdomain !== 'string') {
      return res.status(400).json({ error: 'Subdomain parameter is required' })
    }

    // Validate subdomain format (alphanumeric and hyphens only, 3-63 characters)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        error: 'Invalid subdomain format. Use lowercase letters, numbers, and hyphens (3-63 characters)',
      })
    }

    const namestoneClient = createNamestoneClient()
    const available = await namestoneClient.checkSubdomainAvailability(subdomain)

    return res.status(200).json({
      available,
      subdomain,
    })
  } catch (error: any) {
    console.error('Error checking subdomain availability:', error)
    return res.status(500).json({
      error: error.message || 'Failed to check subdomain availability',
    })
  }
}
