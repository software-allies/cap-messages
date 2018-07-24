export default {
    input: 'dist/index.js',
    output: {
      file: 'dist/bundles/capmessages.umd.js',
      name: 'ng.capmessages',
      globals: {
        '@angular/core': 'ng.core'
      },
      format: 'umd',
      sourceMap: false
    }
  }