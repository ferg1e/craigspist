export function strContainsArray(str, a) {
    for(let i = 0; i < a.length; ++i) {
        const needle = a[i].toLowerCase()
        const isIn = str.toLowerCase().includes(needle)

        if(isIn) {
            return true
        }
    }

    return false
}
