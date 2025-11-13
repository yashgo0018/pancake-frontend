import { ChainId } from '@pancakeswap/chains'
import { useMemo } from 'react'
import { useEnsText } from 'wagmi'

export interface EnsMetadata {
  email?: string
  url?: string
  twitter?: string
  github?: string
  discord?: string
  telegram?: string
  description?: string
  isLoading: boolean
}

const ENS_TEXT_KEYS = {
  email: 'email',
  url: 'url',
  twitter: 'com.twitter',
  github: 'com.github',
  discord: 'com.discord',
  telegram: 'org.telegram',
  description: 'description',
} as const

export const useEnsMetadata = (ensName?: string, chainId: ChainId = ChainId.ETHEREUM): EnsMetadata => {
  const enabled = Boolean(ensName)

  const { data: email, isLoading: emailLoading } = useEnsText({
    name: ensName,
    key: ENS_TEXT_KEYS.email,
    chainId,
    query: { enabled },
  })

  const { data: url, isLoading: urlLoading } = useEnsText({
    name: ensName,
    key: ENS_TEXT_KEYS.url,
    chainId,
    query: { enabled },
  })

  const { data: twitter, isLoading: twitterLoading } = useEnsText({
    name: ensName,
    key: ENS_TEXT_KEYS.twitter,
    chainId,
    query: { enabled },
  })

  const { data: github, isLoading: githubLoading } = useEnsText({
    name: ensName,
    key: ENS_TEXT_KEYS.github,
    chainId,
    query: { enabled },
  })

  const { data: discord, isLoading: discordLoading } = useEnsText({
    name: ensName,
    key: ENS_TEXT_KEYS.discord,
    chainId,
    query: { enabled },
  })

  const { data: telegram, isLoading: telegramLoading } = useEnsText({
    name: ensName,
    key: ENS_TEXT_KEYS.telegram,
    chainId,
    query: { enabled },
  })

  const { data: description, isLoading: descriptionLoading } = useEnsText({
    name: ensName,
    key: ENS_TEXT_KEYS.description,
    chainId,
    query: { enabled },
  })

  return useMemo(
    () => ({
      email: email ?? undefined,
      url: url ?? undefined,
      twitter: twitter ?? undefined,
      github: github ?? undefined,
      discord: discord ?? undefined,
      telegram: telegram ?? undefined,
      description: description ?? undefined,
      isLoading:
        emailLoading ||
        urlLoading ||
        twitterLoading ||
        githubLoading ||
        discordLoading ||
        telegramLoading ||
        descriptionLoading,
    }),
    [
      email,
      url,
      twitter,
      github,
      discord,
      telegram,
      description,
      emailLoading,
      urlLoading,
      twitterLoading,
      githubLoading,
      discordLoading,
      telegramLoading,
      descriptionLoading,
    ],
  )
}
