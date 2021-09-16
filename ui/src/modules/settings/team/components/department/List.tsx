import React from 'react';

type Props = {
    list: any
}

export default function List({ list }: Props) {
    return list.map(item => <div key={item._id}>{item.title}</div>)
}