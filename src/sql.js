'use strict';


/**
 ***************************************
 * 输出接口
 ***************************************
 */
module.exports = (url, {code: app, version, updateInfo}) => {
    return `

set names utf8;
	
-- ${version} 热更新 --

-- 1、 获取新的热更新版本号 --
select @curVersionCode := ifnull(max(version_code), '00')
from m_app_web_version
where app_code = '${app}'
and is_deleted = 0
and (app_version_code_ios = '${version}' or app_version_code_android = '${version}')
;

select @newVersionCode := case when @curVersionCode + 1 > 9 then @curVersionCode + 1 else lpad(@curVersionCode + 1, 2, '0') end
;


-- 2、 作废当前大版本之前的热更新版本 --
update m_app_web_version
set is_deleted = 1, modified_on = now(), modified_by = 'system'
where app_code = '${app}'
and is_deleted = 0
and (app_version_code_ios = '${version}' or app_version_code_android = '${version}')
;


-- 3、 生成当前版本的新热更新版本 --
insert into m_app_web_version (id, version_code, app_code, app_version_code_ios, app_version_code_android,
    release_date, created_on, created_by, modified_on, modified_by, is_deleted, download_url, update_info)
values (uuid(), @newVersionCode, '${app}', '${version}', '${version}',
    now(), now(), 'system', now(), 'system', 0, '${url}', '${updateInfo}')
;

`;
};
