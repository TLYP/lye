import { useEffect, useState } from 'react'
import { Input, InputBase, Combobox, useCombobox, Tooltip, ActionIcon } from '@mantine/core'
import { theme } from '../../../theme'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setActiveSession } from '@/lib/sessions'
import { Session } from '@/app/cachedb/sessions'
import classes from '../styles/combobox.module.scss'

export default function Demo() {
    const sessions = useAppSelector((state) => state.sessions.sessions)
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const dispatch = useAppDispatch()

    const [name, setName] = useState<string | null>(activeSession?.name ?? null)

    useEffect(() => {
        setName(activeSession?.name ?? null)
    }, [activeSession])

    const options = sessions.map((item) => (
        <Combobox.Option key={item.uuid} value={item.uuid} className={classes.option}>
            <span className={classes.optionSpan}>{item.name}</span>
        </Combobox.Option>
    ))

    return (
        <Combobox
            styles={{
                dropdown: {
                    background: theme.colors!.background![0],
                    border: `1px solid ${theme.colors!.background![8]}`
                }
            }}
            store={combobox}
            onOptionSubmit={(val) => {
                combobox.closeDropdown()

                const session = sessions.find((session) => session.uuid === val)
                if (!session || session.uuid == activeSession?.uuid) return

                setName(session.name)
                dispatch(setActiveSession(session))
                Session.setActiveSession(session.uuid)
            }}
        >
            <Combobox.Target>
                <Tooltip
                    classNames={{ tooltip: classes.tooltip }}
                    label={name ?? 'none'}
                    position="right"
                    openDelay={300}
                >
                    <InputBase
                        classNames={{
                            input: classes.searchInput,
                            section: classes.searchSection
                        }}
                        styles={{
                            input: {
                                background: 'var(--background-base)',
                                color: 'var(--text-400)',
                                overflow: 'hidden',
                                border: '1px solid var(--background-800)'
                            }
                        }}
                        component="button"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        rightSectionPointerEvents="none"
                        onClick={() => combobox.toggleDropdown()}
                    >
                        {name || <Input.Placeholder>Select music</Input.Placeholder>}
                    </InputBase>
                </Tooltip>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}
