import { Box, Button, getEnv, Icon, SectionBodyItem, Tip, __ } from '@erxes/ui/src';
import React from 'react';
import { ProductName } from '../../styles';

type Props ={
    list:any,
    isSelectedRiskAssessment:boolean,
}

class SubmissionsComponent extends React.Component<Props> {

    handleSumbmissionForm () {

        const {REACT_APP_CDN_HOST} = getEnv()

        window.open(`${REACT_APP_CDN_HOST}/test?type=form&brand_id=Ca8LyB&form_id=e25o9Q`)
    }

    render() {

        const {list,isSelectedRiskAssessment} = this.props

        if(isSelectedRiskAssessment){
            return null
        }

        return <Box name='riskAssessmentSubmissions' title={__('Risk assessment submissions')}>
            {
                list.map(user=>(
                    <SectionBodyItem key={user._id}>
                        <ProductName>
                            {user.email}
                            <Button btnStyle='link' onClick={this.handleSumbmissionForm}>
                                <Tip text="Submission Form">
                                    <Icon icon='file-alt'/>
                                </Tip>
                            </Button>
                        </ProductName>
                    </SectionBodyItem>
                ))
            }
        </Box>
    }
}

export default SubmissionsComponent