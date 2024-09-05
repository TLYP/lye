import { useState } from 'react'
import { Input, InputBase, Combobox, useCombobox } from '@mantine/core'
import { theme } from '../../theme'
import classes from './styles/combobox.module.css'

const groceries = ['🍎 Apples', '🍌 Bananas', '🥦 Broccoli', '🥕 Carrots', '🍫 Chocolate']

export default function Demo() {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const [value, setValue] = useState<string | null>(null)

    const options = groceries.map((item) => (
        <Combobox.Option value={item} key={item} className={classes.option}>
            {item}
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
                <InputBase
                    styles={{
                        input: {
                            background: theme.colors!.background![0],
                            border: `1px solid ${theme.colors!.background![8]}`
                        }
                    }}
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    onClick={() => combobox.toggleDropdown()}
                >
                    {value || <Input.Placeholder>Pick value</Input.Placeholder>}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}
