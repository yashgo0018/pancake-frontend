import {
  AutoRenewIcon,
  Box,
  Button,
  CheckmarkCircleIcon,
  FlexGap,
  Input,
  Modal,
  ModalV2,
  Text,
} from '@pancakeswap/uikit'
import { useEnsSubdomain } from 'hooks/useEnsSubdomain'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

interface GetEnsModalProps {
  isOpen: boolean
  onDismiss: () => void
  account: string
}

const StyledInput = styled(Input)`
  height: 56px;
  font-size: 16px;
`

const SubdomainSuffix = styled(Text)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 16px;
  pointer-events: none;
`

const AvailabilityText = styled(Text)<{ $available: boolean }>`
  color: ${({ theme, $available }) => ($available ? theme.colors.success : theme.colors.failure)};
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`

export const GetEnsModal: React.FC<GetEnsModalProps> = ({ isOpen, onDismiss, account }) => {
  const [subdomain, setSubdomain] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  const { checkAvailability, mintSubdomain, isCheckingAvailability, isMinting } = useEnsSubdomain()

  // Default project ENS for display (this should match your actual project ENS)
  const projectEns = process.env.NEXT_PUBLIC_NAMESTONE_PROJECT_ENS || 'pancake.eth'

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSubdomain('')
      setIsAvailable(null)
      setHasChecked(false)
    }
  }, [isOpen])

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(value)
    setIsAvailable(null)
    setHasChecked(false)
  }

  const handleCheckAvailability = useCallback(async () => {
    if (!subdomain || subdomain.length < 3) {
      return
    }

    const available = await checkAvailability(subdomain)
    setIsAvailable(available)
    setHasChecked(true)
  }, [subdomain, checkAvailability])

  const handleMint = useCallback(async () => {
    if (!subdomain || !isAvailable) {
      return
    }

    const result = await mintSubdomain(subdomain, account)

    if (result?.success) {
      // Close modal after successful minting
      setTimeout(() => {
        onDismiss()
      }, 2000)
    }
  }, [subdomain, isAvailable, account, mintSubdomain, onDismiss])

  const isValidSubdomain = subdomain.length >= 3 && subdomain.length <= 63

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <Modal title="Get Your Free PancakeSwap ENS" onDismiss={onDismiss} minWidth="min(100vw, 426px)">
        <Box padding="24px">
          <Text mb="16px" color="textSubtle">
            Choose your unique ENS subdomain. It will be yours forever!
          </Text>

          <Box position="relative" mb="8px">
            <StyledInput
              value={subdomain}
              onChange={handleSubdomainChange}
              placeholder="yourname"
              disabled={isMinting}
              style={{ paddingRight: `${projectEns.length * 10 + 40}px` }}
            />
            <SubdomainSuffix>.{projectEns}</SubdomainSuffix>
          </Box>

          {hasChecked && isAvailable !== null && (
            <AvailabilityText $available={isAvailable}>
              {isAvailable ? (
                <>
                  <CheckmarkCircleIcon width="16px" color="success" />
                  Available! This subdomain is yours for the taking.
                </>
              ) : (
                <>❌ Already taken. Try a different name.</>
              )}
            </AvailabilityText>
          )}

          {!hasChecked && subdomain.length > 0 && subdomain.length < 3 && (
            <Text color="failure" fontSize="14px" mt="8px">
              Subdomain must be at least 3 characters long
            </Text>
          )}

          <FlexGap gap="12px" mt="24px" flexDirection="column">
            <Button
              width="100%"
              onClick={handleCheckAvailability}
              disabled={!isValidSubdomain || isCheckingAvailability || isMinting}
              variant={hasChecked && isAvailable ? 'secondary' : 'primary'}
              isLoading={isCheckingAvailability}
              endIcon={isCheckingAvailability ? <AutoRenewIcon spin color="currentColor" /> : undefined}
            >
              {isCheckingAvailability ? 'Checking...' : hasChecked ? 'Check Again' : 'Check Availability'}
            </Button>

            {hasChecked && isAvailable && (
              <Button
                width="100%"
                onClick={handleMint}
                disabled={isMinting}
                isLoading={isMinting}
                endIcon={isMinting ? <AutoRenewIcon spin color="currentColor" /> : undefined}
              >
                {isMinting ? 'Minting...' : 'Mint My ENS ✨'}
              </Button>
            )}
          </FlexGap>

          <Text fontSize="12px" color="textSubtle" mt="16px" textAlign="center">
            Note: Subdomain can only contain lowercase letters, numbers, and hyphens (3-63 characters)
          </Text>
        </Box>
      </Modal>
    </ModalV2>
  )
}
