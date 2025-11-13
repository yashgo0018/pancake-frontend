import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  ChevronDownIcon,
  DiscordIcon,
  FlexGap,
  GithubIcon,
  LinkIcon,
  TelegramIcon,
  Text,
  TwitterIcon,
} from '@pancakeswap/uikit'
import { useEnsMetadata } from 'hooks/useEnsMetadata'
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { ChainId } from '@pancakeswap/chains'

const MetadataContainer = styled(Box)`
  margin-top: 8px;
`

const MetadataToggle = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 0;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
`

const MetadataContent = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 12px;
  margin-top: 8px;
`

const MetadataRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`

const ChevronIcon = styled(Box)<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  transform: rotate(${({ $isOpen }) => ($isOpen ? '180deg' : '0deg')});
`

interface EnsMetadataDisplayProps {
  ensName?: string
  chainId?: ChainId
}

export const EnsMetadataDisplay: React.FC<EnsMetadataDisplayProps> = ({ ensName, chainId = ChainId.ETHEREUM }) => {
  const { t } = useTranslation()
  const [isMetadataOpen, setIsMetadataOpen] = useState(false)
  const ensMetadata = useEnsMetadata(ensName, chainId)

  const hasMetadata = useMemo(() => {
    return Boolean(
      ensMetadata.twitter ||
        ensMetadata.github ||
        ensMetadata.discord ||
        ensMetadata.telegram ||
        ensMetadata.email ||
        ensMetadata.url ||
        ensMetadata.description,
    )
  }, [ensMetadata])

  if (!ensName || !hasMetadata) {
    return null
  }

  return (
    <MetadataContainer>
      <MetadataToggle onClick={() => setIsMetadataOpen(!isMetadataOpen)}>
        <Text fontSize="14px" color="textSubtle">
          {t('ENS profile information available')}
        </Text>
        <FlexGap alignItems="center" gap="4px">
          <Text fontSize="14px" color="primary" fontWeight="600">
            {isMetadataOpen ? t('Hide') : t('Details')}
          </Text>
          <ChevronIcon $isOpen={isMetadataOpen}>
            <ChevronDownIcon width="20px" color="primary" />
          </ChevronIcon>
        </FlexGap>
      </MetadataToggle>

      {isMetadataOpen && (
        <MetadataContent>
          {ensMetadata.description && (
            <MetadataRow>
              <Text fontSize="14px" color="textSubtle">
                {ensMetadata.description}
              </Text>
            </MetadataRow>
          )}

          {ensMetadata.twitter && (
            <MetadataRow>
              <TwitterIcon width="20px" />
              <SocialLink href={`https://twitter.com/${ensMetadata.twitter}`} target="_blank" rel="noopener noreferrer">
                <Text fontSize="14px">@{ensMetadata.twitter}</Text>
              </SocialLink>
            </MetadataRow>
          )}

          {ensMetadata.github && (
            <MetadataRow>
              <GithubIcon width="20px" />
              <SocialLink href={`https://github.com/${ensMetadata.github}`} target="_blank" rel="noopener noreferrer">
                <Text fontSize="14px">{ensMetadata.github}</Text>
              </SocialLink>
            </MetadataRow>
          )}

          {ensMetadata.discord && (
            <MetadataRow>
              <DiscordIcon width="20px" />
              <Text fontSize="14px">{ensMetadata.discord}</Text>
            </MetadataRow>
          )}

          {ensMetadata.telegram && (
            <MetadataRow>
              <TelegramIcon width="20px" />
              <SocialLink href={`https://t.me/${ensMetadata.telegram}`} target="_blank" rel="noopener noreferrer">
                <Text fontSize="14px">@{ensMetadata.telegram}</Text>
              </SocialLink>
            </MetadataRow>
          )}

          {ensMetadata.url && (
            <MetadataRow>
              <LinkIcon width="20px" />
              <SocialLink href={ensMetadata.url} target="_blank" rel="noopener noreferrer">
                <Text fontSize="14px">{ensMetadata.url}</Text>
              </SocialLink>
            </MetadataRow>
          )}

          {ensMetadata.email && (
            <MetadataRow>
              <Text fontSize="14px" color="textSubtle">
                📧
              </Text>
              <Text fontSize="14px">{ensMetadata.email}</Text>
            </MetadataRow>
          )}
        </MetadataContent>
      )}
    </MetadataContainer>
  )
}
