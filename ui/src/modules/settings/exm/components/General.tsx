import { FormControl } from 'modules/common/components/form';
import React, { useState } from 'react';

export default function General() {
    const getEmptyFeature = () => ({ _id: Math.random().toString(), contentType: 'form', name: 'Name' });
    
    const [features, setFeatures] = useState([getEmptyFeature()])

    const onChangeFeature = (type: String, _id?: string) => {
        if (type === 'add') {
            features.push(getEmptyFeature())

            console.log('features: ', features);
            
            setFeatures(features);
        } else {
            const modifiedFeatures = features.filter(f => f._id !== _id);

            setFeatures(modifiedFeatures)
        } 
    }

    const onChangeFeatureItem = (_id: string, name: string, value: any) => {
        const feature = features.find(f => f._id === _id);
        
        if (feature) {
            feature[name] = value;

            setFeatures(features);
        }
    }

    const onChange = (e, _id: string) => {
        onChangeFeatureItem(_id, 'name', e.target.value);
    }

    return (
        <>{features.map(feature => <div style={{ display: "flex", padding: "5px 10px" }} key={feature._id}>
                <div style={{ padding: "0 10px" }}>
                    <FormControl
                        componentClass="select"
                        value={feature.contentType}
                        options={[
                            {
                                value: 'form',
                                label: 'Forms'
                            },
                            {
                                value: 'knowledge',
                                label: 'Knowledge'
                            }
                        ]}
                        onChange={e => onChange(e, feature._id)}
                    />
                </div>
                <div style={{ padding: "0 10px" }}>
                    <FormControl name={`name${feature._id}`} placeholder="Name" value={feature.name} onChange={e => onChange(e, feature._id)} />
                </div>
            </div>)}
            <button onClick={() => onChangeFeature('add')}>Add feature</button>
        </>
    )
}