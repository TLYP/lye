import { useState } from 'react'
import { Input, InputBase, Combobox, useCombobox, Tooltip, ActionIcon } from '@mantine/core'
import { theme } from '../../theme'
import classes from './styles/combobox.module.scss'

const groceries = [
    'Chocological',
    'In Hell We Live, Lament',
    'Between Two Worlds',
    'Colorful',
    'Draft #1'
]

export default function Demo() {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const [value, setValue] = useState<string | null>(null)

    const options = groceries.map((item) => (
        <Combobox.Option key={item} value={item} className={classes.option}>
            <span className={classes.optionSpan}>{item}</span>
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
                setValue(val)
                combobox.closeDropdown()
            }}
        >
            <Combobox.Target>
                <Tooltip
                    classNames={{ tooltip: classes.tooltip }}
                    label={value ?? 'none'}
                    position="right"
                    openDelay={1000}
                >
                    <InputBase
                        classNames={{
                            input: classes.searchInput,
                            section: classes.searchSection
                        }}
                        component="button"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        rightSectionPointerEvents="none"
                        onClick={() => combobox.toggleDropdown()}
                    >
                        {value || <Input.Placeholder>Select music</Input.Placeholder>}
                    </InputBase>
                </Tooltip>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}
