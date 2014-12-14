var $body = $('body'),
    d = document,
    $document = $('document'),
    $spinner = $('.spinner'),
    $window = $(window),
    $document = $(document),
    current_url = document.URL,
    structured_url_host = location.protocol + '//' + location.host,
    structured_url_path = location.protocol + '//' + location.host + location.pathname,
    current_page = 0,
    source = "direct",
    currentURL = document.URL,
    url_search_value = window.location.search,
    client_width = document.documentElement.clientWidth || document.body.clientWidth,
    device,
    platform,
    store,
    event_info, // 用于 GA
    topic_title, // 用于 GA
    page,
    user_id,
    detect_upload = 0,
    topic_id,
    gesture;


// UA
var ua = navigator.userAgent.toLowerCase();

// 各种 dom
var dom_login = $('#template_login').html();
var dom_alert = $('#template_alert').html();
var dom_toast = $('#template_toast').html();
var dom_topic = $('#template_create_topic').html();
var dom_comment = $('#template_create_comment').html();
var dom_add_to_homescreen = $('#template_add_to_homescreen').html();

var os = function() {
  var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua), 
      is_ios = /iPod|iPhone|iPad/i.test(ua),
      is_android = /Android/i.test(ua),
      is_chrome = /Chrome/i.test(ua),
      is_safari = /Safari/i.test(ua),
      is_firefox = /Firefox/i.test(ua),
      is_ipad = /iPad/i.test(ua), 
      is_tablet = /iPad/i.test(ua) || (is_firefox && /Tablet/i.test(ua)),
      is_iphone = /iPhone/i.test(ua) && !is_tablet,
      is_opera= /Opera Mini/i.test(ua),
      is_uc = /UCWEB|UCBrowser/i.test(ua);
      return {
        is_mobile: is_mobile,
        is_ios: is_ios,
        is_android: is_android,
        is_chrome: is_chrome,
        is_safari: is_safari,
        is_firefox: is_firefox,
        is_ipad: is_ipad,
        is_tablet: is_tablet,
        is_iphone: is_iphone,
        is_opera: is_opera,
        is_uc: is_uc
      };
}();

// 如果是手机端则使用 touchend，否则用 click
if (os.is_mobile) {
  gesture = 'touchend';
  device = "Mobile";
} else {
  gesture = 'click';
  device = "PC";
}

// Alert

var alert_pop_up = function(message) {
  Mustache.parse(dom_alert);
  var rendered = Mustache.render(dom_alert, {
    alert_message: message
  });
  if ($('.cover').length == 0) {
    $body.append(rendered);
  } else {
    $('.cover').after(rendered);
  }
}

// Toast
var toast = function(message, callback) {
  Mustache.parse(dom_toast);
  var rendered = Mustache.render(dom_toast, {
    toast_message: message
  });
  if ($('.cover').length == 0) {
    $body.append(rendered);
  } else {
    $('.cover').after(rendered);
  }
  setTimeout(function (argument) {
    $('.fade-out').remove();
  }, 2300);
  
  if (callback == true) {
    setTimeout(function (argument) {
      window.location.href = currentURL;
    }, 2300);
  }
}

function error_alert(jqXHR, exception) {
  if (jqXHR.status === 0) {
    alert_pop_up('网络不给力啊…');
  } else if (jqXHR.status == 404) {
    alert_pop_up('小美脑袋转不动了… 404 <br> <a href="mailto:dev@zuimeia.com" class="text-link">点击这里</a>马上发邮件告诉小最。');
  } else if (jqXHR.status == 500) {
    alert_pop_up('小美脑袋转不动了… 500 <br> <a href="mailto:dev@zuimeia.com" class="text-link">点击这里</a>马上发邮件告诉小最。');
  } else if (exception === 'parsererror') {
    alert_pop_up('小美脑袋转不动了… Requested JSON parse failed. <br> <a href="mailto:dev@zuimeia.com" class="text-link">点击这里</a>马上发邮件告诉小最。');
  } else if (exception === 'timeout') {
    alert_pop_up('小美脑袋转不动了… Time out error. <br> <a href="mailto:dev@zuimeia.com" class="text-link">点击这里</a>马上发邮件告诉小最。');
  } else if (exception === 'abort') {
    alert_pop_up('小美脑袋转不动了… Ajax request aborted. <br> <a href="mailto:dev@zuimeia.com" class="text-link">点击这里</a>马上发邮件告诉小最。');
  } else {
    alert_pop_up('小美脑袋转不动了… 403 Uncaught Error.\n' + ' <br> <a href="mailto:dev@zuimeia.com" class="text-link">点击这里</a>马上发邮件告诉小最。');
  }
}

function detect_login(title_name) {
  if (user_id == undefined) {
    Mustache.parse(dom_login);
    var rendered = Mustache.render(dom_login, {
      title: title_name
    })
    $body.append(rendered);
  }
  
}

// 计算中英文 String 长度
var length_include_chinese = function(str) {
  var l = str.replace(/[^\x00-\xff]/g, "rr").length;
  return l;
}

// 截断功能
function slice_text(dom) {
  var text = dom.innerHTML;
  var length = length_include_chinese(text);
  if (length > 150) {
    var position = Math.floor(length / 2);
    dom.innerHTML = text.slice(0, position) + '…<a class="show-all">显示全部</a>';
  }
}

// 替换 Script 和空格
var purify_string = function(dom) {
  dom = dom.replace(/\s/g, '').replace('<script', '');
  return dom;
}


// 点击取消，删除 cover
var cancel_to_hide_cover = function (argument) {
  $body.on(gesture, '.button-cancel', function() {
    fade_out($('[data-ui-component="cover"]'));
  });
}

// fade_out 功能
var fade_out = function(obj) {
  obj.addClass('fade-out');
  setTimeout(function (e) {
    $('.fade-out').remove();
  }, 350);
}


// 未登录状态点击创建进行提示
var on_click_detect = function (dom) {
  dom.on('click', function (e) {
    e.preventDefault();
    detect_login('小美提示：登录后才可以评论哦~');
  });
}
if (user_id == undefined) {
  on_click_detect($('.js-app-name'));
  on_click_detect($('.js-app-des'));
  on_click_detect($('.js-app-url'));
  on_click_detect($('#upload_img_area'));
}

// 如果是手机端，则添加到手机桌面提示
if (os.is_ios || os.is_android) {
  if (os.is_safari || os.is_chrome) {
    if (localStorage.getItem('add_to_homescreen') != '1') {
      $body.append(dom_add_to_homescreen);
      localStorage.setItem('add_to_homescreen', '1');
      $('.pop-up-img').on(gesture, function (e) {
        $('.cover').remove();
        return false;
      })
    }
  }
}

