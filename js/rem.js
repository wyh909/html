const defaults = {
  designWidth: 375,
  ratio: 100,
  maxWinWidth: Infinity,
  minWinWidth: 0,
  rootEl: 'html'
}

function getRemRatio() {
  let hs = document.documentElement.style
  let defaultFontSize = hs.fontSize
  hs.fontSize = '16px'
  let d = document.createElement('div')
  d.style.width = '10rem'
  d.style.position = 'fixed'
  d.style.zIndex = '-1'
  document.body.appendChild(d)
  let ratio = d.clientWidth / 10 / 16
  document.body.removeChild(d)
  hs.fontSize = defaultFontSize
  return ratio
}

export interface Ret {
  /** 1.2 rem => 120 px */
  rem2px(rem: number): number
  /** 120px => 1.2rem */
  px2rem(px: number): number
  /**
   * @deprecated  deprecated for px2rem
   */
  rem(px: number): number
  /** 120px => 120px */
  px(px: number): number
  remRatio: number
}

/**
 * auto set html's fontSize to make rem flexable
 * @param  {object} opts
 *         {
 *            //设计稿宽度
 *         		designWidth: <number>, initial: 375
 *         		//rem 初始像素值，initial: 100
 *         		//html的fontSize = (opts.initRem/opts.designWidth*winWidth)+'px'
 *         		initRem: <number>,
 *            //用来计算的最大的 winWidth, initial: 960
 *         		maxWinWidth: <number>
 *         }
 */
export default function flexrem(_opts: Partial<typeof defaults>): Ret {
  if (flexrem['flexrem']) {
    console.error('flexrem() can only be called once!')
    return flexrem['flexrem']
  }
  const evts = 'onorientationchange' in window ? ['orientationchange', 'resize'] : ['resize']
  let opts = { ...defaults, ..._opts }
  let timer
  let currentRootSize = 0
  let remRatio = getRemRatio()
  for (let i = 0; i < evts.length; i++) {
    window.addEventListener(
      evts[i],
      function() {
        clearTimeout(timer)
        timer = setTimeout(setFontSize, 300)
      },
      false,
    )
  }

  window.addEventListener(
    'pageshow',
    function(e) {
      if (e.persisted) {
        clearTimeout(timer)
        timer = setTimeout(setFontSize, 300)
      }
    },
    false,
  )
  // 初始化
  setFontSize()

  function setFontSize() {
    let maxWidth = opts.rootEl
      ? document.querySelector(opts.rootEl)!.clientWidth
      : window.innerWidth
    maxWidth = Math.min(maxWidth, opts.maxWinWidth)
    maxWidth = Math.max(maxWidth, opts.minWinWidth)
    currentRootSize = maxWidth / opts.designWidth * opts.ratio / remRatio
    document.documentElement.style.fontSize = (currentRootSize.toFixed(3)) + 'px'
    document.body.style.fontSize = '16px'
  }

  let ret = {
    /** 1.2 rem => 120 px */
    rem2px(rem: number) {
      return (rem * currentRootSize * remRatio) | 0
    },
    /** 120px => 1.2rem */
    px2rem(px: number) {
      return px / opts.ratio + 'rem'
    },
    /**
     * @deprecated  deprecated for px2rem
     */
    rem(px: number) {
      return this.px2rem(px)
    },
    /** 120px => 120px */
    px(px: number) {
      return (px * currentRootSize / opts.ratio * remRatio) | 0
    },
    remRatio,
  }
  flexrem['flexrem'] = ret
  return ret as any
}