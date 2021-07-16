import React, { useCallback, useEffect, useRef } from "react"

const CELL_SIZE = 20

const X = 29
const Y = 29

const generateMapData = () => {
  const arr = []
  for (let i = 0; i < Y - 1; i++) {

    const rows = []

    for (let j = 0; j < X - 1; j++) {
      rows.push(null)
    }

    arr.push(rows)
  }

  return arr
}

function App() {

  const ref = useRef<HTMLCanvasElement>(null)

  const mapDataRef = useRef<any>(generateMapData())

  const majorRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 })

  const pathRef = useRef<Array<{x: number, y: number}>>()

  const generateMaze = useCallback((ctx: CanvasRenderingContext2D, row: number, col: number, lastLeadTo) => {
    if (row >= Y || col>= X) {
      return
    }

    const mapData = mapDataRef.current
    const path = pathRef.current

    let left, top, right, bottom

    if (col + 1 < X - 1) {
      right = {
        row,
        col: col + 1,
        direction: 'right',
      }
    }

    if (row + 1 < Y - 1) {
      bottom = {
        row: row + 1,
        col,
        direction: 'bottom',
      }
    }

    if (col - 1 >= 0) {
      // 左边
      left = {
        row,
        col: col - 1,
        direction: 'left',
      }
    }
    if (row - 1 >= 0) {
      // 上边
      top = {
        row: row - 1,
        col,
        direction: 'top',
      }
    }

    let leadTo = new Set()

    // 给自己更新数据
    if (!mapData[row][col]) {
      switch (lastLeadTo) {
        case 'left':
          leadTo.add('right')
          break
        case 'right':
          leadTo.add('left')
          break
        case 'top':
          leadTo.add('bottom')
          break
        case 'bottom':
          leadTo.add('top')
          break
      }

      mapData[row][col] = {
        x: (col + 1) * CELL_SIZE, 
        y: (row + 1) * CELL_SIZE,
        leadTo,
      }
    }

    const direction = [left, top, right, bottom].filter(item => {
      if (item) {
        const { row, col } = item

        return !mapData[row][col]
      } else {
        return false
      }
    })

    if (!direction?.length) {
      return
    }
    
    const item = mapData[row][col]

    const rand = Math.floor(Math.random() * direction.length)

    const randItem: any = direction.splice(rand, 1)[0]

    const randDirection = randItem?.direction
    const randRow = randItem?.row
    const randCol = randItem?.col

    switch (randDirection) {
      case 'left':
        item.leadTo.add('left')
        ctx.clearRect(item.x - 1, item.y + 1, 2, CELL_SIZE)
        break
      case 'right':
        item.leadTo.add('right')
        ctx.clearRect(item.x + CELL_SIZE - 1, item.y + 1, 2, CELL_SIZE)
        break
      case 'top':
        item.leadTo.add('top')
        ctx.clearRect(item.x + 1, item.y - 1, CELL_SIZE, 2)
        break
      case 'bottom':
        item.leadTo.add('bottom')
        ctx.clearRect(item.x + 1, item.y + CELL_SIZE - 1, CELL_SIZE, 2)
        break
    }
    
    generateMaze(ctx, randRow, randCol, randDirection)

    direction.forEach((d) => {
      generateMaze(ctx, row, col, 0)
    })
  }, [])

  useEffect(() => {
    const canvasNode = ref?.current

    const generateMap = (ctx: CanvasRenderingContext2D) => {

      const start = CELL_SIZE, end = CELL_SIZE * X

      ctx.beginPath()
      ctx.lineWidth = 1
      ctx.moveTo(start, start)
      ctx.lineTo(end, start)
      ctx.lineTo(end, end)
      ctx.lineTo(start, end)
      ctx.lineTo(start, start)
      ctx.stroke()
      
      for (let i = 2; i < X; i++) {
        ctx.beginPath()
        ctx.moveTo(i * start, start)
        ctx.lineTo(i * start, end)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(start, i * start)
        ctx.lineTo(end, i * start)
        ctx.stroke()
      }
      // ctx.clearRect(40, 40, 600, 600)
    }

    const handleKeyDown = (e: any) => {
      const major = majorRef.current
      const ctx = canvasNode?.getContext('2d')
      const mapData = mapDataRef.current

      if (ctx) {
        let temp
        const item = mapData[major.y][major.x]
        ctx.clearRect(item.x + 2, item.y + 2, 15, 15)
        switch (e?.key) {
          case 'ArrowLeft':

            if (item?.leadTo?.has('left')) {
              temp = major.x - 1
              if (temp < 0) {
                temp = 0
              }
              major.x = temp
            }
            
            break
          case 'ArrowUp':
            if (item?.leadTo?.has('top')) {
              temp = major.y - 1
              if (temp < 0) {
                temp = 0
              }
              major.y = temp
            }
            
            break
          case 'ArrowRight':
            if (item?.leadTo?.has('right')) {
              temp = major.x + 1
              if (temp > X - 2) {
                temp = X - 2
              } 
              major.x = temp
            }
            
            break
          case 'ArrowDown':
            if (item?.leadTo?.has('bottom')) {
              temp = major.y + 1
              if (temp > Y - 2) {
                temp = Y - 2
              }
              major.y = temp
            }
            break
        }

        const { x, y } = major
        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.arc(mapData[y][x].x + 10, mapData[y][x].y + 10, 5, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.stroke()

        if (x === X - 2 && y === Y - 2) {
          alert('到达终点')
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
    }

    const init = (ctx: CanvasRenderingContext2D) => {
      const { x, y } = majorRef.current
      const mapData = mapDataRef.current
      ctx.beginPath()
      ctx.strokeStyle = 'red'
      ctx.arc(mapData[y][x].x + 10, mapData[y][x].y + 10, 5, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.strokeStyle = 'green'
      ctx.rect(mapData[Y-2][X-2].x + 4, mapData[Y-2][X-2].y + 4, 12, 12)
      ctx.closePath()
      ctx.stroke()
    }

    if (canvasNode) {
      const ctx = canvasNode?.getContext('2d')

      document.addEventListener('keydown', handleKeyDown)

      if (ctx) {
        generateMap(ctx)
        generateMaze(ctx, 0, 0, 0)
        init(ctx)
      }
      
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const searchPath = (ctx: CanvasRenderingContext2D, x: number, y: number, path: any[], direction: string) => {
    const mapData = mapDataRef.current

    let tempDirection = direction

    const item = mapData[y][x] as { x: number, y: number, leadTo: Set<any> }
    path.push({ x: x, y: y })

    if (pathRef.current) {
      return
    }

    if (x === X - 2 && y === Y - 2) {
      pathRef.current = path.slice()
      return
    }

    const leadTo = Array.from(item.leadTo.keys()).filter(d => d !== tempDirection)



    if (!leadTo.length) {
      
      return
    }

    leadTo.forEach(item => {
      let tempx = x, tempy = y
      switch (item) {
        case 'left':
          tempx -= 1
          tempDirection = 'right'
          break
        case 'right':
          tempx += 1
          tempDirection = 'left'
          break
        case 'bottom':
          tempy += 1
          tempDirection = 'top'
          break
        case 'top':
          tempy -= 1
          tempDirection = 'bottom'
          break
      }

      searchPath(ctx, tempx, tempy, path, tempDirection)
      path.pop()
    })
  }

  const handleBtnClick = useCallback(async () => {
    const canvasNode = ref?.current
    const ctx = canvasNode?.getContext('2d')
    const major = majorRef.current

    const { x, y } = major

    if (ctx) {
      await searchPath(ctx, x, y, [], '')
      const path = pathRef.current as any[]
      const mapData = mapDataRef.current

      for (let i = 1; i < path?.length; i++) {
        const x = path[i].x
        const y = path[i].y
        ctx.beginPath()
        ctx.fillStyle = 'aqua'
        ctx.fillRect(mapData[y][x].x + 4, mapData[y][x].y + 4, 12, 12)
        ctx.closePath()
      }
    }
  }, [])

  return (
    <>
      <button onClick={handleBtnClick}>展示通向终点的路径</button>
      <canvas ref={ref} width={600} height={600} >您的浏览器不支持canvas.</canvas>
    </>
  )
}

export default App
