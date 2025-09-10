import { StyleSheet } from 'react-native'
import { COLORS } from '@/constants/theme'

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'black',
        color: 'white',
    },
    text: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    button: {
        backgroundColor: COLORS.primary,
        color: 'black',
        padding: 10,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 10,
    },
    link: {
        backgroundColor: 'pink',
        color: 'white',
        padding: 10,
        marginTop: 10,
        marginBottom: 20
    }
})