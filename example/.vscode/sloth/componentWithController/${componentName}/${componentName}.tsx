import { inject, observer } from 'mobx-react'
import React, { FunctionComponent } from 'react'
import { View } from 'react-native'
import styles from './styles'


type PublicProps = {}
type PrivateProps = PublicProps & { controller: ${controllerName}ScreenController }

const ${componentName}: FunctionComponent<PrivateProps> = (props: PrivateProps) => {
    return (
       <View style={styles.container}>
         <View />
       </View>
    )
}

export default inject('controller')(observer(${componentName} as FunctionComponent<PublicProps>))