// 判断 source
if (url_search_value.length > 0) {
  source = url_search_value;
}

function event_tracker(name, source, topic_title) {
  ga('send', 'event', name, source, topic_title);
}

function bug_tracker(event_name, bug_message, topic_title) {
  event_info = 'Bug' + '-' + event_name;
  ga('send', 'event', event_info, bug_message, topic_title);
}