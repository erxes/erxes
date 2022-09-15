interface Props {
  data: any;
}

const App = (props: Props) => {

  return (
    <div className='App'>
      <header className='App-header'>
        <p>This is payments window</p>
        <p>{`This is graphql result: ${JSON.stringify(props.data)}`}</p>
      </header>
    </div>
  );
};

export default App;
