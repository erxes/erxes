import { MockedProvider, wait } from '@apollo/react-testing';
import { act } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { withRouter } from 'modules/testing-utils/withRouter';
import * as React from 'react';
import { create } from 'react-test-renderer';
import Email from '../items/Email';

const route = '/activityLogs/email';
const history = createMemoryHistory({
    initialEntries: [route]
});

describe('Email', () => {
    it('should render loading state initially', () => {
        const component = create(
            <MockedProvider mocks={[]}>
                <Email  
                    activity=''
                    emailId='1'
                    emailType='engage'
                 />
                 { history }
            </MockedProvider>
        );

        const tree = component.toJSON();
        expect(tree.children).toContain('Loading...');
    });

    it('error', async () => {
        const component = create(
            <MockedProvider mocks={[]} addTypename={false}>
                {withRouter(
                    <Email 
                        activity=''
                        emailId='2'
                        emailType='engage'
                    /> 
                )}
            </MockedProvider>
        );

        await act(async () => {
            await wait(0);
        }); 
    
        const tree = component.toJSON();
        expect(tree.children).toContain('Error!');
    });

    it('should render content', async () => {
        const component = create(
            <MockedProvider mocks={[]} addTypename={false}>
                {withRouter(
                    <Email 
                        activity=''
                        emailId='2'
                        emailType='engage'
                    />
                )}
            </MockedProvider>
        );
        await wait(0); 
    
        const tree = component.toJSON();
        expect(tree).toBe(null);
    });  
});
