import gql from "graphql-tag";
import * as compose from "lodash.flowright";
import { Alert, withProps } from "modules/common/utils";
import React from "react";
import { graphql } from "react-apollo";
import { mutations } from "@erxes/ui-settings/src/general/graphql";
import styled from "styled-components";

const Container = styled.div`
  h3 {
    color: rgb(103, 63, 189) !important;
    margin-left: 10px;
  }
`;

const Block = styled.div`
  width: 200px;
  height: 200px;
  float: left;
  border: 1px solid #cfc6c6;
  margin: 20px 10px;
  padding: 10px 20px;
  position: relative;

  button {
    position: absolute;
    right: 10px;
    bottom: 10px;
    background: rgb(103, 63, 189);
    border-radius: 5px;
    color: rgb(255, 255, 255);
    border: none;
    font-weight: 500;
    outline: 0px;
    padding: 5px 15px;
    cursor: pointer;
  }

  .uninstall {
    background: #eb5a5a;
  }

  p {
    text-transform: capitalize;
    margin-bottom: 10px;
    font-weight: bold;

    i {
      color: rgb(103, 63, 189);
      font-weight: bold;
      font-size: 20px;
      margin-right: 3px;
    }
  }
`;

type FinalProps = {
  manageInstall;
  enabledServicesQuery;
};

class Installer extends React.Component<FinalProps, { loading: any }> {
  constructor(props) {
    super(props);

    this.state = {
      loading: {}
    }
  }

  render() {
    const { enabledServicesQuery } = this.props;
    const { loading } = this.state;

    const enabledServices = enabledServicesQuery.enabledServices || {};

    const manageInstall = (type: string, name: string) => {
      this.setState({ loading: { [name]: true } });

      this.props
        .manageInstall({
          variables: { type, name },
        })
        .then(() => {
          Alert.success("You successfully installed");
          window.location.reload();
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    };

    const plugins = [
      { name: "cards", icon: 'icon-piggy-bank', description: "Utamur graecis ex mel. Cum paulo aliquando ex. Quo et nominati ullamcorper. Habeo graeco has at." },
      { name: "automations", icon: "icon-circular", description: "Vix esse ornatus te. Graece insolens vis in, nam dicam deterruisset ea, aeque libris " },
      { name: "calendar", icon: "icon-calendar-alt", description: "sit eius aperiri te, no tation iudicabit quo. Ei eos quando theophrastus. Cu eius disputationi quo, per viris explicari eu." },
      { name: "clientportal", icon: "icon-megaphone", description: " Numquam dolorem corrumpit mea at, docendi dolores temporibus duo at, vel et ornatus." },
      { name: "engages", icon: "icon-megaphone", description: "Nominavi antiopam argumentum cu qui. Vidisse diceret offendit duo ad, an eius simul ceteros nam" },
      { name: "knowledgebase", icon: "icon-book-open", description: "At eros mnesarchum vis. Ne vix malorum invenire liberavisse, mea in nulla invenire, duo ei torquatos concludaturque" },
      { name: "segments", icon: "icon-chart-pie-alt", description: "Sed errem omnium interpretaris id, quodsi integre pro te, rebum debitis prodesset te mei." },
      { name: "inbox", icon: "icon-chat", description: "Sed errem omnium interpretaris id, quodsi integre pro te, rebum debitis prodesset te mei." },
      { name: "contacts", icon: "icon-users", description: "Qui ut iudico blandit, sea at vidit recusabo, eos ne amet cibo. Ius id modus volumus recteque" },
      { name: "forms", icon: "icon-book-open", description: "Sed ad legimus consequat, sed laudem aeterno euripidis eu. Qui copiosae recusabo ocurreret no," },
      { name: "internalnotes", icon: "icon-megaphone", description: "In vel omnes utinam mediocritatem, vim ut aperiam contentiones." },
      { name: "logs", icon: "icon-book-open", description: "In vel omnes utinam mediocritatem, vim ut aperiam contentiones." },
      { name: "notifications", icon: "icon-megaphone", description: "Sed ad legimus consequat, sed laudem aeterno euripidis eu. Qui copiosae recusabo ocurreret no," },
      { name: "tags", icon: "icon-users", description: "At eros mnesarchum vis. Ne vix malorum invenire liberavisse, mea in nulla invenire, duo ei torquatos concludaturque" },
      { name: "integrations", icon: "icon-megaphone", description: "Sed errem omnium interpretaris id, quodsi integre pro te, rebum debitis prodesset te mei." },
      { name: "products", icon: "icon-users", description: "In vel omnes utinam mediocritatem, vim ut aperiam contentiones." },
    ];

    return (
      <Container>
        <h3>Plugins</h3>

        {plugins.map((plugin) => {
          return (
            <Block key={plugin.name}>
              <p>
                <i className={plugin.icon} /> {plugin.name}
              </p>

              <div className="description">
                {plugin.description}
              </div>

              {
                enabledServices[plugin.name]
                ?
                (
                  <button onClick={manageInstall.bind(this, 'uninstall', plugin.name)} className="uninstall">
                    { loading[plugin.name] ? 'Loading ...' : 'Uninstall' }
                  </button>
                )
                : (
                  <button onClick={manageInstall.bind(this, 'install', plugin.name)}>
                    { loading[plugin.name] ? 'Loading ...' : 'Install' }
                  </button>
                )
              }
            </Block>
          );
        })}
      </Container>
    );
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, {}, {}>(
      gql(`query enabledServices {
          enabledServices
        }`),
      {
        name: "enabledServicesQuery",
      }
    ),
    graphql<{}>(gql(mutations.managePluginInstall), {
      name: "manageInstall",
    })
  )(Installer)
);
