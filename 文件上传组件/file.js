// $.fn.fileUpload - by Chris
/*
options{
	fileMaxSize : Math.pow(1024,3), //文件最大限制 默认1G
	fileAllowType : "js/rar/html/css", //文件类型限制
	filePath : "d:/fileUpload"; //文件上传路径
	url : "http://localhost:8080/fileserver/fileUpload.action"  //后台接收文件服务
}
*/
;(function($,window){
	function FileUpload(ele,options){
		var _this = this;
		_this.ele = ele;
		_this.options = options;

		//初始化该元素
		FileUpload.init.call(_this);
	}

	//默认配置
	FileUpload.DEFAULT = {
		fileMaxSize : Math.pow(1024,3), //文件最大限制 默认1G
		fileAllowType : "js/rar/html/css", //文件类型限制
		filePath : "d:/fileUpload",
		url : "http://localhost:8080/fileserver/fileUpload.action"  //后台接受文件服务
	}

	//初始化函数
	FileUpload.init = function(){
		var _this = this;
		FileUpload.render.call(_this);
	}

	//渲染模板
	FileUpload.TEMPLATE = 
		'<section id="fileUploadArea>' + 
			'<section id="fileUploadBox">' +
				'<div id="fileSelectPanel"><p>将文件拖拽到这里</p></div>' +
			'</section>' +
			'<section id="fileUploadTable">' +
				'<a href="#" id="fileUploadBtn" class="btn btn-success" style="display:none">上传</a>' +
				'<table class="table table-bordered table-hover">' +
					'<thead><tr><th width="30%">文件名</th><th width="10%">类型</th><th width="10%">大小</th><th width="40%">进度</th><th width="10%">状态</th></tr></thead>' +
					'<tbody></tbody>' +
				'</table>' +
			'<section>' +
		'</section>';


	//渲染函数
	FileUpload.render = function(){
		//获取当前要渲染的元素
		var _this = this;
		var vars = {};
		var $element = this.ele;
		_this.vars = vars;
		//在该元素中添加html
		vars.$element = $element.html(FileUpload.TEMPLATE);
		// 定义变量
		vars.$fileSelectPanel = $element.find("#fileSelectPanel"); //上传区域
		vars.$fileUploadTable = $element.find("#fileUploadTable").find("tbody"); //表格
		vars.$fileUploadBtn = $element.find("#fileUploadBtn"); //上传按钮

		FileUpload.bindEvent.call(_this);
	}

	//事件绑定
	FileUpload.bindEvent = function(){
		var _this = this;
		var files = [] //用来保存上传的文件列表
		var $element = _this.vars.$element;
		var $fileSelectPanel = _this.vars.$fileSelectPanel;
		var $fileUploadTable = _this.vars.$fileUploadTable;
		var $fileUploadBtn = _this.vars.$fileUploadBtn;
		var fileMaxSize = _this.options.fileMaxSize;
		var fileAllowType =_this.options.fileAllowType;
		var url = _this.options.url;
		//文件存储路径
		var filePath = _this.options.filePath;

		//绑定表格删除事件
		$fileUploadTable.on("click","a.deletBtn",function(){
			var $tr = $(this).parents('tr');
			var index = $tr.index();
			$tr.remove();
			files.splice(index,1);
			alert('删除成功!');
		});

		// 绑定panel事件
		//鼠标拖拽进入
		$fileSelectPanel.on("dragenter",function(){
			$(this).addClass("fileInput").children("p").text("可以松开鼠标");
		});
		//鼠标拖拽离开
		$fileSelectPanel.on("dragleave",function(){
			$(this).removeClass("fileInput").children("p").text("将文件拖拽到这里");
		});
		//鼠标拖拽拖动
		$fileSelectPanel.on("dragover",function(){
			return false;
		});
		//鼠标拖拽释放
		$fileSelectPanel.on("drop",function(ev){
			var fs = ev.originalEvent.dataTransfer.files;
			analysisFiles(fs);		//解析列表函数
			$(this).removeClass("fileInput").children("p").text("将文件拖拽到这里");
			return false;
		});

		//绑定文件上传按钮事件
		$fileUploadBtn.on("click",function(){
			$fileUploadBtn.off();  //解除绑定事件
			$fileUploadBtn.hide();  //隐藏
			$fileUploadTable.off(); //解除绑定事件
			var $trs = $fileUploadTable.find('tr');
			for(var i = 0;i < $trs.length; i++){
				uploadFile($trs.eq(i),i); //上传该文件
			}

			//上传文件到服务器
			function uploadFile(tr,i){
				// 创建FormData对象
				var formData = new FormData();
				//获取文件对象
				var fileData = files[i].data;
				var fileName = files[i].name;
				formData.append("fileData",fileData);
				formData.append("fileName",encodeURI(encodeURI(fileName)));
				formData.append("filePath",filePath);

				var $progress = tr.find(".progress-bar"); //进度条
				var $deletBtn = tr.find("a.deletBtn"); //删除按钮
				$deletBtn.text("正在上传");

				//向服务器发送ajax请求
				var request = $.ajax({
					type : "POST",
					url : url,
					data : formData,
					processData: false,  //数据为FormData格式不需要ajax进行数据处理
		    		contentType: false,  //FormData已经声明了属性enctype="multipart/form-data"

		    		//此函数创建完XMLHttpRequest进行调用，所以这里先为进度条绑定监听事件，再把数据交回ajax进行处理
		    		xhr : function(){
		    			var xhr = $.ajaxSettings.xhr();
						if($progress && xhr.upload) {
							xhr.upload.addEventListener("progress" , onprogress, false);　
							return xhr;
						}
		    		},
		    		//上传成功执行
		    		success : function(){
		    			tr.addClass("success");
		    			$deletBtn.text("上传成功").addClass("text-success");
		    		},
		    		//上传失败执行
		    		error : function(){
		    			tr.addClass("danger");
		    			$deletBtn.text("上传失败").addClass("text-danger");
		    		},

				});

				//侦测附件上传情况
				function onprogress(evt){
					var loaded = evt.loaded;	//已经上传大小情况  
					var tot = evt.total;		//附件总大小  
					var per = Math.floor(100*loaded/tot);  //已经上传的百分比
					$progress.html( per +"%" ); 
					$progress.css("width" , per +"%");
				}
			}
		});

		//文件类
		function File(name,type,size,data){
			this.data = data; //文件数据
			this.name = name; //文件名
			this.type = type; //文件类型
			this.size = size; //文件大小
		}

		//分析文件列表
		function analysisFiles(fileList){
			//获取文件列表长度
			var flength = fileList.length;
			//如果文件列表为空则直接返回
			if(flength.length == 0){
				return false;
			}
			//循环处理每一个文件
			for(var i = 0;i < flength;i++){
				var fi = fileList[i];
				//获取文件信息
				var name = fi.name;
				var type = fileType(name);
				var size = fi.size;
				var file = new File(name,type,size,fi);

				//限制文件大小
				if(size > fileMaxSize || size == 0){
					alert("文件大小超出范围");
					continue;
				}
				//限制文件类型
				if((fileAllowType).indexOf(type) == -1){
					alert(type + " 的文件类型不被允许");
					continue;
				}

				if(compareFile(files,file)){
					files.push(file);
				}else{
					alert("文件: " + file.name +" 重复，已剔除该文件！");
				}
				
			}
			//生成表格
			createTable();
			$fileUploadBtn.show();
		}

		//生成表格
		function createTable(){
			$fileUploadTable.empty();
			for(var i = 0;i < files.length;i++){
				var file = files[i];

				var $tr = $('<tr></tr>');
				var str = '<td>' + file.name + '</td>';
				str += '<td>' + file.type + '</td>';
				str += '<td>' + bytesToSize(file.size) + '</td>';
				str += '<td><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 0%;min-width: 20px;">0%</div></div></td>';
				str += '<td><a href="#" class="deletBtn">删除</a></td>';
				$tr.html(str);
				$fileUploadTable.append($tr);
			}
			
		}
		//获取文件类型
		function fileType(filename){
			var arr = filename.split(".");
			var type = arr[arr.length - 1].toLowerCase();
			if(type == undefined){
				type = "nuknown";
			}
			return type;
		}

		//字节大小转换，参数为b
		function bytesToSize(bytes) {
		    var sizes = ['B', 'K', 'M' ,'G'];
		    if (bytes == 0){
		    	return 'n/a';
		    }
		    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
		};

		//比较去重
		function compareFile(files,file){
			var flag = true;
			$.each(files,function(i,obj){
				if(obj.name == file.name && obj.type == file.type && obj.size == file.size){
					flag = false;
					return;
				}
			});
			return flag;
		}
	}


	function Plugin(option){
		//循环遍历每一个元素
		return this.each(function(){
			var $this = $(this); //获取当前的jq元素
			var obj = $this.data("fileUpload");

			//判断是否为初次创建或传入的为对象
			if(!obj || typeof option == "object"){
				var options = $.extend({},FileUpload.DEFAULT,option); //合并默认属性和传入的属性
				$this.data("fileUpload",new FileUpload($this,options));
			}
			//如果为字符串则调用相应的函数
			if(typeof option == "string" && typeof obj[option] == "function") obj[option]();
		});
	}
	//扩展jQuery
	$.fn.fileUpload = Plugin;
})(jQuery,window);