
interface IProps {
    label:string,
    query:any,
    value:object | string | number,
    onChange:Function,
    searchField:string,
    labelField:Function | string,
    
}

function InfoComponent(props:IProps) {

    return <div>
        <input/>
    </div>
}