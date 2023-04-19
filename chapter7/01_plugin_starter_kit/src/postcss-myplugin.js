const plugin = () => ({
    postcssPlugin: 'myPlugin',
    prepare() {
        return {
            Rule(rule) {}
        }
    }
})
