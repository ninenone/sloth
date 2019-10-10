import React, { FunctionComponent } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styles from './styles'


type Props = {
    children: JSX.Element | JSX.Element[]
    style?: StyleProp<ViewStyle>
}

const ${containerName}: FunctionComponent<Props> = (props: Props) => {
    return (
       <View style={[styles.container, props.style]}>
         {props.children}
       </View>
    )
}

export default ${containerName}