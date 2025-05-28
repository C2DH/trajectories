import type { Legend } from '../types'

const HeaderTimeline: React.FC<{
  legend?: Legend
  showDescription?: boolean
  children?: React.ReactNode
}> = ({ legend, children, showDescription }) => {
  if (!legend) {
    return 'no legend'
  }
  return (
    <div className='HeaderTimeline row mb-3'>
      <div className='col-6'>
        <h2>
          {legend.name}
          <br />
          <span className=' text-muted'>{legend.yearSpan}</span>
        </h2>
        <h3>{legend.title}</h3>
      </div>
      {!!showDescription && <div className='col-6'>{legend.description}</div>}
      <div className='col-6 offset-6'>{children}</div>
    </div>
  )
}

export default HeaderTimeline
