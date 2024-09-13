import { ActionIcon, Menu, rem } from '@mantine/core'
import { IconPlus, IconFile, IconBrandSpotify } from '@tabler/icons-react'
import ComboBox from './combobox'
import LocalFileModal from './localFileModal'
import { useDisclosure } from '@mantine/hooks'

export default function Component() {
    const [opened, { open, close }] = useDisclosure(false)

    return (
        <div className="flex gap-2 items-center min-w-56 h-12 px-4">
            <LocalFileModal opened={opened} close={close} />

            <Menu position="bottom-start">
                <Menu.Target>
                    <ActionIcon color="background.8" variant="outline">
                        <IconPlus color="var(--text-500)" />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>Source</Menu.Label>
                    <Menu.Item
                        onClick={open}
                        leftSection={<IconFile width={rem(18)} height={rem(18)} />}
                    >
                        Local File
                    </Menu.Item>
                    <Menu.Item
                        disabled
                        leftSection={<IconBrandSpotify width={rem(18)} height={rem(18)} />}
                    >
                        Soundcloud
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

            <div className="min-w-36">
                <ComboBox />
            </div>
        </div>
    )
}
