export default {
  // plugins: [
  //   [
  //     '@babel/plugin-transform-runtime',
  //     {
  //       hash: true,
  //       coreJs: true,
  //       regeneratorRuntime: true,
  //       fetch: true,
  //       webcomponents: true,
  //     }
  //   ]
  // ],
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: "usage",
        targets: {
          safari: '11'
        },
        corejs: 3
      }
    ]
  ],
}
