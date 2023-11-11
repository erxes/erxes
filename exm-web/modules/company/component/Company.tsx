import { useExm } from "../hooks/useExm"

const Company = ({ type }: { type: string }) => {
  const { exm } = useExm()

  if(type === 'structure') {
    return <div dangerouslySetInnerHTML={{ __html: exm.structure || "" }} />
  }

  return <div dangerouslySetInnerHTML={{ __html: exm.vision || "" }} />
}

export default Company
