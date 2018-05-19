class MyInput extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      value: '',
      items: []
    }
  }

  componentWillMount() {
    
    $.ajax({
      url: "get.php",
      data: {'proc':"dishes"},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        var items = data.map(function(key, i) {
         return { id: key['dish'], label: key['dish'] };
        });
        this.setState({items: items});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
     
  }

  render() {


    return (
      <ReactAutocomplete
        items={this.state.items}
        xitems={[
          { id: 'foo', label: 'foo' },
          { id: 'bar', label: 'bar' },
          { id: 'baz', label: 'baz' },
        ]}
        shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
        getItemValue={item => item.label}
        renderItem={(item, highlighted) =>
          <div
            key={item.id}
            style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
          >
            {item.label}
          </div>
        }
        value={this.state.value}
        onChange={e => this.setState({ value: e.target.value })}
        onSelect={value => this.setState({ value })}
      />
    )
  }
}

  var domContainerNode = window.document.getElementById('content');
  ReactDOM.unmountComponentAtNode(domContainerNode);
  ReactDOM.render(<MyInput />, domContainerNode)
