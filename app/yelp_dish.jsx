
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
      if (i < num)
        dummy.push("starOn");
      else if (i == num && halfNeeded)
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
    else
      return (
          <div className='business_name' onClick={this.onClickBusiness}>
                 {this.props.business_name}
                 <Stars num={this.props.stars} />
          </div>
      )
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
           <span onClick={this.previous} style={{'marginRight':'10px'}}>previous</span>
           <span onClick={this.close} style={{'marginRight':'10px'}}>close</span>
           <span onClick={this.next}>next</span>
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
       this.dish = row['caption'];
       return (
         <div className='SampleBusinessDish'>
           <img src={this.url} onClick={this.setViewerIdx}/>
           <div onClick={this.onClickHandler}>{this.dish}</div>
         </div>
       );
  }
});

//
// The page for a given dish.
//
var DishPage = React.createClass({
  getInitialState: function() {
    return {results:[], related:[], dish_name:'', viewerIdx:0};
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

  componentWillMount: function() {
    var dish = getParam('dish', 'sushi');
    dish = unescape(dish);
    this.dish = dish;
    console.log("requested dish:" + dish);
    this.search(dish);
    this.related(dish);
  },

  render : function() {

    var results = this.state.results.map(function(row,i) {
       return (
          <BusinessDish key={i} viewerIdx={i} data={row} show_business={true}  setViewerIdx={this.setViewerIdx}/>
       )
    }.bind(this));

    var related = this.state.related.map(function(row,i) {
       return (
          <RelatedBusinessDish key={i} data={row} />
       )
    });

    return (
    <div>
      <div id="home">
        <a href="javascript:location.search=''"><img width='30' src="home.png" /></a>
      </div>
      <div className="related_stuff_div">{related}</div>
      <div id="page_title">{this.dish}</div>
      <div>{results}</div>
      <Viewer data={this.state.results} idx={this.state.viewerIdx}/>
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
      ... and can be learned from the <a href='https://github.com/johndimm/WhatLooksGood/blob/master/README.md'>Yelp Dataset Challenge</a>
      </div>

      <div>{sample}</div>
      <Viewer data={this.state.sample} idx={this.state.viewerIdx}/>
    </div>
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
    this.dishes();
    this.related();
    this.businessInfo();
  },

  render : function() {

    var dishes = this.state.dishes.map(function(row,i) {
       return (
          <BusinessDish key={i} viewerIdx={i}  data={row} show_business={false} setViewerIdx={this.setViewerIdx}/>
       )
    }.bind(this));

    var related = this.state.related.map(function(row,i) {
       return (
          <RelatedBusiness key={i} data={row} />
       )
    });

    var neighborhood = this.state.businessInfo.neighborhood == ''
      || this.state.businessInfo.neighborhood == null ? ''
      : this.state.businessInfo.neighborhood + ", ";
    var city = this.state.businessInfo.city == '' ? ''
      : this.state.businessInfo.city;
    var business_name = this.state.businessInfo.name == '' ? ''
      : this.state.businessInfo.name;

    return (
    <div>
      <div id="home">
        <a href="javascript:renderRoot('','')"><img width='30' src="home.png" /></a>
      </div>
      <div className="related_stuff_div">{related}</div>

      <div id="page_title">
        {business_name}
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

function renderRoot(dish, business_id) {
  var domContainerNode = window.document.getElementById('content');
  ReactDOM.unmountComponentAtNode(domContainerNode);

  window.history.pushState('', 'What looks good?', '?dish=' + dish + '&business_id=' + business_id);

  if (dish != '')
    ReactDOM.render(<DishPage />, domContainerNode);
  else if (business_id != '')
    ReactDOM.render(<BusinessPage business_id={business_id}/>, domContainerNode);
  else
    ReactDOM.render(<SamplePage />, domContainerNode);
}


function initApp() {
  var dish = getParam('dish', '');
  var business_id = getParam('business_id', '');
  renderRoot(dish, business_id);
}