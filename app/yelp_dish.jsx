function getParam(key, defaultValue) {
    var value = defaultValue;

    var s = location.search.replace("?",'');
    var p = s.split("&");
    for (var i=0; i<p.length; i++) {
      var parts = p[i].split("=");
      if (parts.length > 1) {
        if (parts[0] == key)
          value = parts[1];
      }
    }

    return value;
}

function getPhotoUrl(photo_id) {
//  return "../photos/" + photo_id + ".jpg";
  return "http://www.johndimm.com/yelp_photos/photos/" + photo_id + ".jpg";
}

//
// Display stars below a business name.
//
var Stars = React.createClass({
  render: function() {

    var stars = parseFloat(this.props.num);
    var num = Math.floor(stars);
    var halfNeeded = (stars - num == 0.5);
    var dummy = Array();
    for (var i=1; i<=5; i++) {
      if (i <= num)
        dummy.push("starOn");
      else if (i == num + 1 && halfNeeded)
        dummy.push("starHalf");
      else
        dummy.push("starOff");
    }
    return (
      <div className='stars_div'>
        {
          dummy.map(function(key, i) {
              return ( <span key={i} className={key}>✭</span> );
           })
        }
      </div>
    );
  }
});

//
// Display name and stars for a business.
//
var Business = React.createClass({
  onClickBusiness: function() {
      // location.search = "?business_id=" + this.business_id;
      renderRoot('', this.props.business_id);
  },

  render: function() {

    if (this.props.business_name == '')
      return ( null )
    else {
      var stars = this.props.stars != null ? ( <Stars num={this.props.stars} /> ) : null;
      return (
          <div className='business_name' onClick={this.onClickBusiness}>
                 {this.props.business_name}
                 {stars}
          </div>
      )
    }
  }
});

//
// The popup full-scale image viewer.
//
var Viewer = React.createClass({

  getInitialState: function() {
    return {idx: this.props.idx};
  },

  componentDidMount: function() {
    document.body.onkeyup = function(e){
        this.onKeyUp(e);
    }.bind(this);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({idx: nextProps.idx});
  },

  close: function() {
    $("#viewer_div").css("visibility", "hidden");
  },

  next: function() {
    this.setState({idx: Math.min(this.props.data.length - 1, this.state.idx + 1)});
  },

  previous: function() {
    this.setState({idx: Math.max(0, this.state.idx - 1)});
  },

  onClickDish: function() {
      // location.search = "?dish=" + this.dish;
      renderRoot(this.dish, '');
  },


  onKeyUp: function(event) {
    switch (event.keyCode) {
      case 37:
        // left
        this.previous();
        break;
      case 38:
        // up
        break;
      case 39:
        // right
        this.next();
        break;
      case 40:
        // down
        break;
    }
  },

  render: function() {
       var row = this.props.data[this.state.idx];
       var url = '';
       var caption = '';
       var business_name = '';
       this.dish = '';
       this.business_id = 0;
       var stars = 0;
       if (row != null) {
         url = getPhotoUrl(row['photo_id']);
         caption = row['caption'];
         business_name = row['business_name'];
         stars = row['stars'];
         this.dish = row['dish'];
         this.business_id = row['business_id'];
       }

       return (
         <div id="viewer_div" style={{'visibility':'hidden'}}>
           <Business business_name={business_name} business_id={this.business_id} stars={stars} />

           <div onClick={this.onClickDish}>
             <img id="viewer" src={url} />
             <div className='caption_text'>{caption}</div>
           </div>

           <div id="viewer_controls">
           <button onClick={this.previous}>previous</button>
           <button onClick={this.close}>close</button>
           <button onClick={this.next}>next</button>
           </div>
         </div>
       )
  }
});

//
// Display a business and photo in a card.
//
var BusinessDish = React.createClass({
  onClickDish: function() {
      //location.search = "?dish=" + this.dish;
      renderRoot(this.dish, '');
  },

  setViewerIdx: function() {
    this.props.setViewerIdx(this.props.viewerIdx);
  },

  render: function() {
       var row = this.props.data;
       this.url = getPhotoUrl(row['photo_id']);
       var caption = row['caption'];
       var business_name = row['business_name'];
       var stars = row['stars'];
       this.dish = row['dish'];
       this.business_id = row['business_id'];

       var business_section = this.props.show_business ? (
           <Business business_name={business_name} business_id={this.business_id} stars={stars} />
       ) : ( null );

       var className = this.props.show_business ? 'BusinessDish' : 'JustDish';

       return (
         <div className={className}>
           {business_section}
           <img src={this.url}  onClick={this.setViewerIdx}/>
           <div className='caption_text' onClick={this.onClickDish}>{caption}</div>
         </div>
       );
  }
});

//
// Show "recommended" dishes for a given dish.
// These are displayed at the top, with smaller photos, and show only the dish name.
//
var RelatedBusinessDish = React.createClass({
  onClickHandler: function() {
     // location.search = "?dish=" + this.dish;
      renderRoot(this.dish, '');
  },

  render: function() {
       var row = this.props.data;
       var url = getPhotoUrl(row['photo_id']);
       this.dish = row['dish'];
       return (
         <div className='RelatedBusinessDish' onClick={this.onClickHandler} >
           <img src={url} />
           <div>{this.dish}</div>
         </div>
       );
  }
});

//
// "Recommended" restaurants to the given restaurant.
//
var RelatedBusiness = React.createClass({
  onClickHandler: function() {
     // location.search = "?business_id=" + this.business_id;
      renderRoot('', this.business_id);
  },

  render: function() {
       var row = this.props.data;
       this.business_id = row['business_id'];
       var business_name = row['name'];
       var url = getPhotoUrl(row['photo_id']);
       return (
         <div className='RelatedBusiness' onClick={this.onClickHandler} >
           <img src={url} />
           <div>{business_name}</div>
         </div>
       );
  }
});

//
// The home page shows one of each core dish, found using exact match co-occurrence.
//
var SampleBusinessDish = React.createClass({
  onClickHandler: function() {
      // location.search = "?dish=" + this.dish;
      renderRoot(this.dish, '');
  },

  setViewerIdx: function() {
    this.props.setViewerIdx(this.props.viewerIdx);
  },

  render: function() {
       var row = this.props.data;
       this.url = getPhotoUrl(row['photo_id']);
       this.dish = row['dish'];
       return (
         <div className='SampleBusinessDish'>
           <img src={this.url} onClick={this.setViewerIdx}/>
           <div onClick={this.onClickHandler}>{this.dish}</div>
         </div>
       );
  }
});

//
// Display the list of related dishes at the top of the dish page.
//
var RelatedDishes = React.createClass({

  getInitialState: function() {
    return {related:[]};
  },

  componentWillMount: function() {;
    this.related(this.props.dish);
  },

  related: function(dish) {
    $.ajax({
      url: "get.php",
      data: {'proc':"dish_reco", 'dish': dish},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({related: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  },

  render: function() {
      var related = this.state.related.map(function(row,i) {
       return (
          <RelatedBusinessDish key={i} data={row} />
       )
    });
    return (
        <div className="related_stuff_div">{related}</div>
    )
  }
});


//
// The page for a given dish.
//
var DishPage = React.createClass({
  getInitialState: function() {
    return {results:[], dish_name:'', viewerIdx:0};
  },

  setViewerIdx: function(i) {
    this.setState({viewerIdx: i});
    $("#viewer_div").css('visibility', 'visible');
  },

  sample: function(dish) {
    $.ajax({
      url: "get.php",
      data: {'proc': "dish_sample"},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({sample: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  },

  search: function(dish) {
    $.ajax({
      url: "get.php",
      data: {'proc': "dish_search", 'dish': dish},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({results: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  },


  componentWillMount: function() {
    var dish = getParam('dish', 'sushi');
    dish = unescape(dish);
    this.dish = dish;
    console.log("requested dish:" + dish);
    this.search(dish);
  },

  render : function() {
    var results = this.state.results.map(function(row,i) {
       return (
          <BusinessDish key={i} viewerIdx={i} data={row} show_business={true}  setViewerIdx={this.setViewerIdx}/>
       )
    }.bind(this));

    return (
    <div>
      <div id="home">
        <a href="javascript:window.renderRoot('','')"><img width='30' src="home.png" /></a>
      </div>
      <RelatedDishes dish={this.dish} />
      <div id="page_title">{this.dish}</div>
      <div>{results}</div>
      <Viewer data={this.state.results} idx={this.state.viewerIdx}/>
    </div>
    );
  }

});

var RelatedBusinesses = React.createClass({
  getInitialState: function() {
    return {related:[]};
  },

  related: function(dish) {
    $.ajax({
      url: "get.php",
      data: {'proc': "business_reco", 'business_id': this.props.business_id},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({related: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  },

  componentWillMount: function() {
    this.related();
  },

  render: function() {
    var related = this.state.related.map(function(row,i) {
       return (
          <RelatedBusiness key={i} data={row} />
       )
    });

    return (
          <div className="related_stuff_div">{related}</div>
    );
  }
});


//
// The page for a given restaurant.
//
var BusinessPage = React.createClass({
  getInitialState: function() {
    return {dishes:[], related:[], businessInfo:{}, viewerIdx:0};
  },

  setViewerIdx: function(i) {
    this.setState({viewerIdx: i});
    $("#viewer_div").css('visibility', 'visible');
  },

  businessInfo: function(dish) {
    $.ajax({
      url: "get.php",
      data: {'proc': "business_info", 'business_id': this.props.business_id},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);

        // The first and only element of the array is about this business.
        this.setState({businessInfo: data[0]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  },

  dishes: function(dish) {
    $.ajax({
      url: "get.php",
      data: {'proc': "business_dishes", 'business_id': this.props.business_id},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({dishes: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  },


  componentWillMount: function() {
    this.dishes();
    this.businessInfo();
  },

  render : function() {

    var dishes = this.state.dishes.map(function(row,i) {
       return (
          <BusinessDish key={i} viewerIdx={i}  data={row} show_business={false} setViewerIdx={this.setViewerIdx}/>
       )
    }.bind(this));


    var neighborhood = this.state.businessInfo.neighborhood == ''
      || this.state.businessInfo.neighborhood == null ? ''
      : this.state.businessInfo.neighborhood + ", ";
    var city = this.state.businessInfo.city == '' ? ''
      : this.state.businessInfo.city;
    var business_name = this.state.businessInfo.name == '' ? ''
      : this.state.businessInfo.name;

    var yelpLink = "https://www.yelp.com/search?find_desc=" + escape(business_name)
      + "&find_loc=" + escape(city) + "&ns=1";

    return (
    <div>
      <div id="home">
        <a href="javascript:renderRoot('','')"><img width='30' src="home.png" /></a>
      </div>
      <RelatedBusinesses business_id={this.props.business_id} />

      <div id="page_title">
        <a href={yelpLink} target="YELP_WINDOW">{business_name}</a>
        <div className='business_info'>
          {neighborhood}{city}
        </div>
        <Stars num={this.state.businessInfo.stars} />
      </div>

      <div>{dishes}</div>
      <Viewer data={this.state.dishes} idx={this.state.viewerIdx}/>
    </div>
    );
  }

});

//
// The home page, listing one of each dish.
//
var SamplePage = React.createClass({
  getInitialState: function() {
    return {sample:[], viewerIdx:0};
  },

  setViewerIdx: function(i) {
    this.setState({viewerIdx: i});
    $("#viewer_div").css('visibility', 'visible');
  },


  sample: function(dish) {
    $.ajax({
      url: "get.php",
      data: {'proc': "dish_sample"},
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({sample: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  },

  componentWillMount: function() {
    this.sample();
  },

  dishSearch: function() {
    var searchTerm = $("#dish_search").val();
    renderRoot(searchTerm, '');
  },

  dishSearchAuto: function(searchTerm) {
    renderRoot(searchTerm['value'], '');
  },

  keyDown: function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 13) {
      this.dishSearch();
      return false;
    }
  },

  render : function() {

    var sample = this.state.sample.map(function(row,i) {
       return (
          <SampleBusinessDish key={i} viewerIdx={i} data={row} setViewerIdx={this.setViewerIdx}/>
       )
    }.bind(this));

    return (
    <div>
      <div id="page_title">What looks good?</div>

      <div id="page_subtitle">
      ... and can be <a href='https://github.com/johndimm/WhatLooksGood/blob/master/README.md'>learned</a> from the
         <a href="https://www.yelp.com/dataset/challenge">Yelp Dataset Challenge</a>
      </div>

      <div id="dish_search_div">
        Dishes: <MyInput onSelect={this.dishSearchAuto} />
      </div>

      <div>{sample}</div>
      <Viewer data={this.state.sample} idx={this.state.viewerIdx}/>
    </div>
    );
  }

});


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
        onSelect={value => this.props.onSelect({ value })}
      />
    )
  }
}

window.onpopstate = function (event) {
  if(event.state) {
    replaceContent(event.state.dish, event.state.business_id);
  }
}

function replaceContent(dish, business_id) {
  var domContainerNode = window.document.getElementById('root');
  ReactDOM.unmountComponentAtNode(domContainerNode);

  if (dish != '')
    ReactDOM.render(<DishPage />, domContainerNode);
  else if (business_id != '')
    ReactDOM.render(<BusinessPage business_id={business_id}/>, domContainerNode);
  else
    ReactDOM.render(<SamplePage />, domContainerNode);
}

function renderRoot(dish, business_id) {
  window.history.pushState({dish:dish, business_id:business_id},
    null, '?dish=' + dish + '&business_id=' + business_id);
  replaceContent(dish, business_id);
}


$(document).ready (function() {
  var dish = getParam('dish', '');
  var business_id = getParam('business_id', '');
  renderRoot(dish, business_id);
});

// Attach this function to the window object so it can be called
// from href="javascript:window.renderRoot..."
window.renderRoot = renderRoot;
