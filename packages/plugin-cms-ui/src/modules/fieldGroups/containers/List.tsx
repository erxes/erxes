import React from 'react'
import { useParams } from 'react-router-dom';

type Props = {

}


const list = (props: Props) => {
    const { cpId = '' } = useParams<{ cpId: string }>();
  return (
    <div>list</div>
  )
}

export default list