export default defineAppConfig({
  pages: [
    'pages/records/index',
    'pages/todo/index',
    'pages/mine/index',
    'pages/inspection/index',
    'pages/photo/index',
    'pages/rectify/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '材料进场验收',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#165DFF',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/records/index',
        text: '验收记录'
      },
      {
        pagePath: 'pages/todo/index',
        text: '待办整改'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
