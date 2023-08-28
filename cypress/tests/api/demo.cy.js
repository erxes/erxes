describe('Demo', () => {

    beforeEach(() => {
      cy.exec('yarn run cypress:seedDB')
    })

    const userId = 'dbtWgcicmtYSgRjja';

    it("login", function () {
        cy.request("POST", 'http://localhost:4000/graphql', {
          query: `mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password)
          }`,
          variables: {
            email: 'admin@erxes.io',
            password: 'Admin123@',
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
        });

        cy.request("post", 'http://localhost:4000/graphql', {
            query: `query Query {
                users {
                  _id
                }
              }`,
        }).then((response) => {
            expect(response.body.data.users[0]._id).to.eq(userId);
        })
      });
})