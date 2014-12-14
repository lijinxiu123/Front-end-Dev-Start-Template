// 使用 Mustache (https://github.com/janl/mustache.js)

var api_endless_pagination = '/api/v1/topic/?offset=';
var limit_endless_pagination = 20;

// 处理数据
function loadData(response) {
	if (response.data.meta.next == null) {
		loading_page = 1;
	} else {
		loading_page = 0;
		// $('.no-more').fadeIn();
	}
	// 指定一个模板为变量
	var template = $('#template_pagination_list').html();
	Mustache.parse(template);
	for (var i = 0, l = response.data.objects.length; i < l; i++) {
		// 开始渲染
		var rendered = Mustache.render(template, response.data.objects[i]);

		// 把渲染好的模板放到 div 里
		$('#wrapper-endless-pagination').append(rendered);

		// 找到带有评论的 primary-block，并对评论进行截断
		if (response.data.objects[i].comment_times > 0) {

			num = limit_endless_pagination + i;

			// 找到带有评论的 primary-block，再锁定评论
			var primary_block_part_text = $('.primary-block')[num].getElementsByClassName('primary-block__part-text')[0];

			// 对于长度过长的段落进行截断
			slice_text(primary_block_part_text);
		}
	}

}


// 修改页码 & 加上页面中其他的参数
function next_page_with_JSON(argument) {
	current_page++;
	var new_URL = structured_url_host + api_endless_pagination + current_page * limit_endless_pagination;
	var split_href = document.URL.split('?');
	var parameters = split_href[1];

	// 查看页面中是否有其他的参数
	// 如果有其他参数则需要加上
	if (parameters) {
		parameters = parameters.replace(/[?&]offset=[^&]*/, '');
		new_URL += '&' + parameters;
	}
	return new_URL;
}


// 做 Ajax Call 获取数据 
var loading_page = 0;

function get_next_page(argument) {
	if (loading_page != 0) return;

	loading_page++;
	$spinner.fadeIn();

	$.getJSON(next_page_with_JSON(), {}, update_content)
		.complete(function() {
			$spinner.fadeOut();
		})
}

function update_content(response) {
	loadData(response);
}


// 查看是否到时候应该加载了
function ready_for_next_page(argument) {
	// if (!$('#next_page_spinner').is(":visible")) return;
	var threhold = 200;
	var bottom_position = $window.scrollTop() + $window.height();
	var distance_from_bottom = $document.height() - bottom_position;
	return distance_from_bottom <= threhold;
}


// 如果是时候加载则执行 get_next_page
function observeScroll(argument) {
	if (ready_for_next_page()) get_next_page();
}

$document.scroll(observeScroll);