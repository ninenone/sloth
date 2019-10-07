import { inject, observer } from 'mobx-react'
import React, { FunctionComponent } from 'react'
import { View } from 'react-native'
import styles from './styles'


type PublicProps = {}
type PrivateProps = PublicProps & { controller: ${screenName}ScreenController }

const ${screenName}: FunctionComponent<PrivateProps> = (props: PrivateProps) => {
    return (
       <View style={styles.container}>
         <View />
       </View>
    )
}

export default inject('controller')(observer(${screenName} as FunctionComponent<PublicProps>))